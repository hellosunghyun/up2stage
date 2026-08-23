import { describe, it, expect } from "vitest";
import { adaptAgentJob } from "../../../../src/core/agent/adapter";
import type { AgentJob } from "../../../../src/core/agent/types";
import type { DocumentRecord } from "../../../../src/models/canonical";

const baseDocs: DocumentRecord[] = [
  {
    id: "doc-1",
    caseId: "case-1",
    fileName: "공고문.pdf",
    extension: "pdf",
    contentHash: "h1",
    upstageFileId: "file-1",
    renderType: "pdf",
    processingStatus: "uploaded",
    createdAt: 0,
  },
  {
    id: "doc-2",
    caseId: "case-1",
    fileName: "신청서.pdf",
    extension: "pdf",
    contentHash: "h2",
    upstageFileId: "file-2",
    renderType: "pdf",
    processingStatus: "uploaded",
    createdAt: 0,
  },
];

function makeJob(overrides?: Partial<AgentJob>): AgentJob {
  return {
    id: "job-1",
    object: "response",
    created_at: 1700000000,
    status: "completed",
    model: "agt-test",
    output: [],
    ...overrides,
  };
}

describe("AgentOutputAdapter", () => {
  it("classifies documents and maps additional_values confidence", () => {
    const job = makeJob({
      output: [
        {
          id: "o-parse",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "step_1_parse",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({ content: { html: "<p>공고</p>" } }),
              additional_values: JSON.stringify({ document_ids: ["file-1", "file-2"] }),
            },
          ],
        },
        {
          id: "o-classify-1",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "step_2_classify",
          content: [
            {
              type: "output_text",
              text: "primary_notice",
              additional_values: JSON.stringify({
                document_type: { _value: "primary_notice", confidence_score: 0.95 },
                page_ranges: [[1, 2]],
              }),
            },
          ],
        },
        {
          id: "o-classify-2",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "step_2_classify",
          content: [
            {
              type: "output_text",
              text: "application_form",
              additional_values: JSON.stringify({
                document_type: { _value: "application_form", confidence_score: 0.88 },
                page_ranges: [[3, 5]],
              }),
            },
          ],
        },
      ],
    });

    const result = adaptAgentJob(job, { id: "case-1" }, baseDocs);

    expect(result.documents[0]?.role).toBe("primary_notice");
    expect(result.documents[0]?.roleConfidence).toBeCloseTo(0.95);
    expect(result.documents[0]?.pageRange).toEqual([1, 2]);
    expect(result.documents[1]?.role).toBe("application_form");
    expect(result.documents[1]?.pageRange).toEqual([3, 5]);
  });

  it("parses and stores extract field values with locations", () => {
    const job = makeJob({
      output: [
        {
          id: "o-classify",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "step_2_classify",
          content: [
            {
              type: "output_text",
              text: "primary_notice",
              additional_values: JSON.stringify({
                document_type: { confidence_score: 0.9 },
                page_ranges: [[1, 1]],
              }),
            },
          ],
        },
        {
          id: "o-extract",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "Information Extract - primary_notice_extract",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                subject: "2026년 공고",
                deadline: "2026-03-31",
              }),
              additional_values: JSON.stringify({
                page_ranges: [[1, 1]],
                subject: {
                  _value: "2026년 공고",
                  page: 1,
                  confidence_score: 0.98,
                  coordinates: [{ x: 0.1, y: 0.1 }],
                },
              }),
            },
          ],
        },
      ],
    });

    const result = adaptAgentJob(job, { id: "case-1" }, baseDocs);

    expect(result.extracts).toHaveLength(1);
    const extract = result.extracts[0];
    expect(extract?.schemaName).toBe("primary_notice_extract");
    const subject = extract?.values.find((v) => v.field === "subject");
    expect(subject?.value).toBe("2026년 공고");
    expect(subject?.page).toBe(1);
    expect(subject?.confidenceScore).toBeCloseTo(0.98);
    expect(subject?.location?.coordinates).toEqual([{ x: 0.1, y: 0.1 }]);
  });

  it("builds canonical guidance with citations from additional_values", () => {
    const job = makeJob({
      output: [
        {
          id: "o-instruct",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "Instruct - initial_guidance",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                overview: "이 공고는 2026년 장학금 선발 안내입니다.",
                top_requirements: ["재학 증명서"],
                nearest_deadline: "2026-03-31",
                required_submissions: ["신청서", "성적 증명서"],
                top_cautions: ["서류 누락 불가"],
                next_actions: ["서류 준비"],
                missing_information: ["개인정보"],
                personalization_status: "not_evaluated",
              }),
              additional_values: JSON.stringify({
                citations: [
                  {
                    index: 1,
                    source_type: "primary_notice",
                    source_ref: "subject",
                    node_index: 0,
                    page: 1,
                    coordinates: [{ x: 0.1, y: 0.1 }],
                  },
                ],
              }),
            },
          ],
        },
      ],
    });

    const result = adaptAgentJob(job, { id: "case-1" }, baseDocs);

    expect(result.guidance).not.toBeNull();
    expect(result.guidance?.overview).toContain("2026년");
    expect(result.guidance?.topRequirements).toEqual(["재학 증명서"]);
    expect(result.guidance?.citations[0]?.sourceType).toBe("primary_notice");
    expect(result.guidance?.citations[0]?.page).toBe(1);
  });
});
