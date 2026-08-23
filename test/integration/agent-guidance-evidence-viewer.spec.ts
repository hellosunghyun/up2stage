import { beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import finalRunFixture from "../fixtures/upstage/job_XHVD4hULc9tFatRSVr7Bgx.sample.json";
import { adaptAgentJob } from "../../src/core/agent/adapter";
import { agentJobSchema } from "../../src/core/agent/types";
import { SourceRegistry } from "../../src/core/evidence";
import { buildGuidanceViewData } from "../../src/features/guidance/adapter";
import { navigateToSource } from "../../src/features/source-navigation/navigate";
import type { DocumentRecord } from "../../src/models/canonical";
import { db } from "../../src/core/storage/db";
import {
  getCanonicalAgentResult,
  getDocumentFilesForCase,
  saveCase,
  saveDocuments,
  saveDocumentFile,
  saveExtracts,
  saveGuidance,
  saveParseElements,
  saveQuickQuestions,
  saveSources
} from "../../src/core/storage/repositories";

const CASE_ID = "case-final-run";
const FILE_IDS = [
  "file_VjYrgaPXmpDMPzKASqF3MN",
  "file_YBuzcZN4uwahtUQubvPKB4",
  "file_8caaxsSreQgqaGzrNCpNqY",
  "file_HjkQ8VvzTiexLzWewFCuJv",
  "file_VHPVXFb6ixMeKBzbhkhksm"
];

const documents: DocumentRecord[] = [
  ["notice", "공고문.pdf", "pdf"],
  ["essay", "자기소개서.hwp", "hwp"],
  ["reference", "참고 목록.xlsx", "xlsx"],
  ["checklist", "자가 체크리스트.hwp", "hwp"],
  ["procedure", "신청방법.pdf", "pdf"]
].map(([id, fileName, extension], index) => ({
  id: `doc-${id}`,
  caseId: CASE_ID,
  fileName: fileName ?? "document",
  extension: extension ?? "",
  contentHash: `hash-${id}`,
  upstageFileId: FILE_IDS[index],
  renderType: extension === "xlsx" ? "xlsx" : extension === "hwp" ? "hwp" : "pdf",
  processingStatus: "uploaded",
  createdAt: 0
}));

describe("final v0.22 Agent to Viewer integration", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("connects canonical guidance, quick questions, evidence and Viewer focus", async () => {
    const job = agentJobSchema.parse(finalRunFixture);
    const result = adaptAgentJob(job, { id: CASE_ID }, documents);

    expect(result.documents.map((document) => document.role)).toEqual([
      "primary_notice",
      "application_form",
      "reference_material",
      "requirements_checklist",
      "procedure_guide"
    ]);
    expect(result.parseElements.length).toBeGreaterThan(20);
    expect(result.sources.every((source) => source.sourceId.startsWith("src:"))).toBe(true);
    expect(result.sources.some((source) => source.documentId === "doc-reference")).toBe(true);
    expect(
      result.sources
        .filter((source) => source.documentId === "doc-reference")
        .every((source) => source.page === 1)
    ).toBe(true);
    expect(
      Math.max(
        ...result.sources
          .filter((source) => source.documentId === "doc-essay")
          .map((source) => source.page)
      )
    ).toBeLessThanOrEqual(2);
    expect(
      Math.max(
        ...result.sources
          .filter((source) => source.documentId === "doc-procedure")
          .map((source) => source.page)
      )
    ).toBeLessThanOrEqual(6);

    const guidance = buildGuidanceViewData(result);
    expect(guidance?.guidance.overview).toContain("서울미래인재재단");
    expect(guidance?.applicationForm?.format_constraints).toContain("맑은고딕 11pt");
    expect(guidance?.procedure?.completion_checks.length).toBeGreaterThan(0);
    expect(guidance?.sourceGroups.topRequirements.length).toBeGreaterThan(0);

    const selectQuestion = result.quickQuestions.find(
      (question) => question.key === "university_location_type"
    );
    expect(selectQuestion).toMatchObject({
      inputType: "select",
      required: true,
      options: ["서울 소재", "비서울 소재", "원격대학"]
    });
    expect(selectQuestion?.ruleText).toContain("서울 소재 대학교");
    expect(new Set(result.quickQuestions.map((question) => question.key)).size).toBe(
      result.quickQuestions.length
    );

    const sourceId = guidance?.sourceGroups.topRequirements[0];
    expect(sourceId).toBeDefined();
    expect(sourceId ? guidance?.sourceLabels[sourceId] : undefined).toMatch(/공고문.*p\./);
    const registry = new SourceRegistry().register(result.sources);
    const source = sourceId ? registry.get(sourceId) : undefined;
    expect(source?.documentId).toBe("doc-notice");

    const viewer = {
      selectDocument: vi.fn(),
      goToPage: vi.fn().mockResolvedValue(undefined),
      focusSource: vi.fn().mockResolvedValue(undefined),
      outlineSelect: vi.fn(),
      accessibilityFocus: vi.fn()
    };
    if (sourceId) {
      await navigateToSource(sourceId, registry, viewer);
    }
    expect(viewer.selectDocument).toHaveBeenCalledWith("doc-notice");
    expect(viewer.goToPage).toHaveBeenCalledWith(source?.page);
    expect(viewer.focusSource).toHaveBeenCalledWith(expect.objectContaining({ sourceId }));
    expect(viewer.outlineSelect).toHaveBeenCalled();

    await saveCase({
      id: CASE_ID,
      sourcePage: {
        url: "https://example.com/opportunity",
        title: "지원 공고",
        normalizedUrl: "https://example.com/opportunity"
      },
      status: "processed",
      selectedDocumentIds: documents.map((document) => document.id),
      agentJobId: result.agentJobId,
      agentStatus: "completed",
      createdAt: 0,
      updatedAt: result.completedAt
    });
    await Promise.all([
      saveDocuments(result.documents),
      saveParseElements(result.parseElements),
      saveSources(result.sources),
      saveExtracts(result.extracts),
      saveGuidance(result.guidance),
      saveQuickQuestions(result.quickQuestions),
      saveDocumentFile({
        caseId: CASE_ID,
        documentId: "doc-notice",
        bytes: new Uint8Array([37, 80, 68, 70]).buffer,
        mimeType: "application/pdf",
        createdAt: 0
      })
    ]);

    const stored = await getCanonicalAgentResult(CASE_ID);
    const viewerFiles = await getDocumentFilesForCase(CASE_ID);
    expect(stored?.guidance?.overview).toContain("서울미래인재재단");
    expect(stored?.sources.some((item) => item.sourceId === sourceId)).toBe(true);
    expect(stored?.quickQuestions).toHaveLength(result.quickQuestions.length);
    expect(new Uint8Array(viewerFiles[0]?.bytes ?? new ArrayBuffer(0))).toEqual(
      new Uint8Array([37, 80, 68, 70])
    );
  });
});
