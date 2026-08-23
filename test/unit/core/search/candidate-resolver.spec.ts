import { describe, expect, it } from "vitest";
import { SourceRegistry } from "../../../../src/core/evidence";
import {
  resolveCandidateSources,
  searchFileNameForChunk,
} from "../../../../src/core/search";
import type { ChunkRecord, SourceRecord } from "../../../../src/models/canonical";

const chunk: ChunkRecord = {
  id: "chunk:doc:1",
  caseId: "case-1",
  documentId: "doc-1",
  sectionPath: ["신청 일정"],
  text: "신청 마감은 8월 30일입니다.",
  sourceIds: ["src:doc-1:p2:e5", "src:doc-1:p2:e6"],
  pages: [2],
  contentHash: "chunkhash",
};
const sources: SourceRecord[] = [
  {
    sourceId: "src:doc-1:p2:e5",
    caseId: "case-1",
    documentId: "doc-1",
    page: 2,
    elementId: 5,
    category: "heading2",
    text: "신청 일정",
  },
  {
    sourceId: "src:doc-1:p2:e6",
    caseId: "case-1",
    documentId: "doc-1",
    page: 2,
    elementId: 6,
    category: "paragraph",
    text: "신청 마감은 8월 30일입니다.",
  },
];

describe("Candidate Source resolver", () => {
  it("narrows Search hit through ChunkRecord into registered SourceRecords", () => {
    const result = resolveCandidateSources({
      hits: [{ filename: searchFileNameForChunk(chunk), score: 0.9, text: "검색 표현" }],
      chunks: [chunk],
      registry: new SourceRegistry().register(sources),
      caseId: "case-1",
    });
    expect(result.hits[0]?.chunk.id).toBe(chunk.id);
    expect(result.sources.map((source) => source.sourceId)).toEqual(chunk.sourceIds);
  });

  it("does not treat an unknown Search filename as evidence", () => {
    const result = resolveCandidateSources({
      hits: [{ filename: "unknown.md", score: 1, text: "AI summary" }],
      chunks: [chunk],
      registry: new SourceRegistry().register(sources),
      caseId: "case-1",
    });
    expect(result.sources).toEqual([]);
    expect(result.unresolvedFilenames).toEqual(["unknown.md"]);
  });
});
