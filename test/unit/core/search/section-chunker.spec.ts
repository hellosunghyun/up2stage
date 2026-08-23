import { describe, expect, it } from "vitest";
import { chunkDocument } from "../../../../src/core/search";
import type {
  DocumentRecord,
  ParseElement,
  SourceRecord,
} from "../../../../src/models/canonical";

const caseId = "case-chunker";

function fixture(
  rows: Array<{
    text: string;
    type?: ParseElement["type"];
    category?: string;
    level?: number;
    page?: number;
  }>
) {
  const document: DocumentRecord = {
    id: "doc-notice",
    caseId,
    fileName: "공고문.pdf",
    extension: "pdf",
    contentHash: "document-hash",
    role: "primary_notice",
    renderType: "pdf",
    processingStatus: "complete",
    createdAt: 0,
  };
  const sources: SourceRecord[] = rows.map((row, index) => ({
    sourceId: `src:doc-notice:p${row.page ?? 1}:e${index + 1}`,
    caseId,
    documentId: document.id,
    page: row.page ?? 1,
    elementId: index + 1,
    category: row.category ?? row.type ?? "paragraph",
    text: row.text,
  }));
  const parseElements: ParseElement[] = rows.map((row, index) => ({
    id: `parse-${index}`,
    caseId,
    documentId: document.id,
    sourceId: sources[index]!.sourceId,
    elementId: index + 1,
    category: row.category ?? row.type ?? "paragraph",
    type: row.type ?? "paragraph",
    ...(row.level ? { level: row.level } : {}),
    page: row.page ?? 1,
    text: row.text,
  }));
  return { document, sources, parseElements };
}

describe("SectionChunker", () => {
  it("uses headings before lower-priority boundaries", async () => {
    const input = fixture([
      { text: "지원 안내", type: "heading", category: "heading1", level: 1 },
      { text: "지원 자격은 다음과 같습니다." },
      { text: "신청 일정", type: "heading", category: "heading2", level: 2 },
      { text: "2026년 8월 30일까지 신청합니다." },
    ]);
    const chunks = await chunkDocument({ caseId, ...input });
    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.sectionPath).toEqual(["지원 안내"]);
    expect(chunks[1]?.sectionPath).toEqual(["지원 안내", "신청 일정"]);
  });

  it.each(["1. 지원 대상", "1-1. 세부 조건", "가. 신청 방법", "① 재학생", "제1조 목적", "붙임 1 제출 양식"])(
    "recognizes numbered structure: %s",
    async (marker) => {
      const input = fixture([{ text: "도입 문장" }, { text: marker }, { text: "설명" }]);
      const chunks = await chunkDocument({ caseId, ...input });
      expect(chunks).toHaveLength(2);
      expect(chunks[1]?.sectionPath.at(-1)).toBe(marker);
    }
  );

  it("keeps table-heavy content attached to registered source IDs", async () => {
    const input = fixture([
      { text: "제출 서류", type: "heading", category: "heading1", level: 1 },
      { text: "구분 | 제출물", type: "table", category: "table" },
      { text: "필수 | 신청서", type: "table", category: "table" },
      { text: "추가 안내" },
    ]);
    const chunks = await chunkDocument({ caseId, ...input });
    const tableChunk = chunks.find((chunk) => chunk.text.includes("구분 | 제출물"));
    expect(tableChunk?.sourceIds).toEqual([
      "src:doc-notice:p1:e1",
      "src:doc-notice:p1:e2",
      "src:doc-notice:p1:e3",
      "src:doc-notice:p1:e4",
    ]);
  });

  it("uses length boundaries and overlap for a long document", async () => {
    const input = fixture(
      Array.from({ length: 10 }, (_, index) => ({
        text: `${index + 1}번째 설명 ${"긴본문".repeat(18)}`,
      }))
    );
    const chunks = await chunkDocument({
      caseId,
      ...input,
      limits: { targetTokens: 120, maxTokens: 170, minTokens: 20, overlapTokens: 35 },
    });
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[1]?.sourceIds.some((id) => chunks[0]?.sourceIds.includes(id))).toBe(true);
  });

  it("does not split only because the page changes", async () => {
    const input = fixture([
      { text: "같은 문단의 앞부분", page: 1 },
      { text: "같은 문단의 뒷부분", page: 2 },
    ]);
    const chunks = await chunkDocument({ caseId, ...input });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.pages).toEqual([1, 2]);
  });

  it("rejects Parse elements missing from the Source Registry", async () => {
    const input = fixture([{ text: "원문" }]);
    await expect(
      chunkDocument({ caseId, ...input, sources: [] })
    ).rejects.toThrow("Source Registry에 없는 Parse Element");
  });
});
