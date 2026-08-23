import { describe, expect, it, vi } from "vitest";
import { SourceRegistry } from "../../../../src/core/evidence";
import { searchFileNameForChunk } from "../../../../src/core/search";
import { answerQuestion } from "../../../../src/features/qa";
import type {
  ChunkRecord,
  DocumentRecord,
  SourceRecord,
} from "../../../../src/models/canonical";

const caseId = "case-qa";
const document: Pick<DocumentRecord, "id"> = { id: "doc-qa" };
const sources: SourceRecord[] = [
  {
    sourceId: "src:doc-qa:p1:e1",
    caseId,
    documentId: document.id,
    page: 1,
    elementId: 1,
    category: "paragraph",
    text: "필수 제출물은 신청서와 재학증명서입니다.",
  },
  {
    sourceId: "src:doc-qa:p2:e5",
    caseId,
    documentId: document.id,
    page: 2,
    elementId: 5,
    category: "paragraph",
    text: "원격대학 재학생은 지원 대상에서 제외됩니다.",
  },
  {
    sourceId: "src:doc-qa:p9:e9",
    caseId,
    documentId: document.id,
    page: 9,
    elementId: 9,
    category: "paragraph",
    text: "검색되지 않은 다른 근거",
  },
];
const chunk: ChunkRecord = {
  id: "chunk:doc-qa:1",
  caseId,
  documentId: document.id,
  sectionPath: ["지원 자격"],
  text: sources[1]!.text,
  sourceIds: [sources[1]!.sourceId],
  pages: [2],
  contentHash: "qa-hash",
};

function baseInput() {
  return {
    caseId,
    documents: [document],
    chunks: [chunk],
    extracts: [],
    registry: new SourceRegistry().register(sources),
  };
}

describe("Retrieval & Solar Q&A controller", () => {
  it("answers cached submissions without Search or Solar", async () => {
    const search = vi.fn();
    const askSolar = vi.fn();
    const result = await answerQuestion({
      ...baseInput(),
      question: "무엇을 준비해야 하나요?",
      cachedFacts: [
        {
          kind: "submissions",
          values: ["신청서", "재학증명서"],
          sourceIds: [sources[0]!.sourceId],
        },
      ],
      dependencies: { search, askSolar },
    });
    expect(result).toMatchObject({ origin: "cached", status: "answered" });
    expect(result.answer).toContain("재학증명서");
    expect(search).not.toHaveBeenCalled();
    expect(askSolar).not.toHaveBeenCalled();
  });

  it.each([
    ["마감은 언제인가요?", "schedule", "2026년 8월 30일 18:00"],
    ["주의사항을 알려줘", "cautions", "제출 후 접수 완료 여부를 확인하세요."],
    ["다음에 무엇을 해야 하나요?", "actions", "신청서를 작성하세요."],
  ] as const)("answers representative cached question: %s", async (question, kind, value) => {
    const search = vi.fn();
    const askSolar = vi.fn();
    const result = await answerQuestion({
      ...baseInput(),
      question,
      cachedFacts: [{ kind, values: [value], sourceIds: [sources[0]!.sourceId] }],
      dependencies: { search, askSolar },
    });
    expect(result).toMatchObject({ origin: "cached", status: "answered" });
    expect(result.answer).toContain(value);
    expect(search).not.toHaveBeenCalled();
    expect(askSolar).not.toHaveBeenCalled();
  });

  it("retrieves the expected chunk and narrows Solar to candidate sources", async () => {
    const askSolar = vi.fn().mockResolvedValue({
      answer: "원격대학 재학생은 지원 대상이 아닙니다.",
      decision: "ineligible",
      evidenceSourceIds: [sources[1]!.sourceId],
      missingInformation: [],
      nextActions: [],
    });
    const result = await answerQuestion({
      ...baseInput(),
      question: "원격대학도 지원 가능한가요?",
      cachedFacts: [],
      dependencies: {
        search: vi.fn().mockResolvedValue([
          { filename: searchFileNameForChunk(chunk), score: 0.95, text: "검색 표현" },
        ]),
        askSolar,
      },
    });
    expect(result).toMatchObject({ origin: "solar", status: "answered", decision: "ineligible" });
    expect(askSolar).toHaveBeenCalledWith(
      expect.objectContaining({
        relevantChunks: [chunk],
        candidateSources: [sources[1]],
      })
    );
  });

  it("rejects a fabricated or non-candidate source ID", async () => {
    const result = await answerQuestion({
      ...baseInput(),
      question: "원격대학도 지원 가능한가요?",
      cachedFacts: [],
      dependencies: {
        search: vi.fn().mockResolvedValue([
          { filename: searchFileNameForChunk(chunk), score: 0.95, text: "검색 표현" },
        ]),
        askSolar: vi.fn().mockResolvedValue({
          answer: "잘못된 근거의 답변",
          evidenceSourceIds: [sources[2]!.sourceId, "src:fabricated:p1:e1"],
          missingInformation: [],
          nextActions: [],
        }),
      },
    });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.evidenceSourceIds).toEqual([]);
    expect(result.rejectedSourceIds).toEqual([
      sources[2]!.sourceId,
      "src:fabricated:p1:e1",
    ]);
  });

  it("returns insufficient evidence when Search cannot resolve a candidate", async () => {
    const result = await answerQuestion({
      ...baseInput(),
      question: "문서에 없는 질문",
      cachedFacts: [],
      dependencies: {
        search: vi.fn().mockResolvedValue([
          { filename: "unknown.md", score: 0.99, text: "AI summary" },
        ]),
        askSolar: vi.fn(),
      },
    });
    expect(result).toMatchObject({ status: "insufficient_evidence", evidenceSourceIds: [] });
    expect(result.answer).toContain("insufficient evidence");
  });
});
