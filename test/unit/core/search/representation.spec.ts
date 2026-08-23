import { describe, expect, it } from "vitest";
import { buildSearchDocument } from "../../../../src/core/search";
import type { ChunkRecord } from "../../../../src/models/canonical";

describe("Search representation", () => {
  it("keeps retrieval context separate from original evidence text", () => {
    const chunk: ChunkRecord = {
      id: "chunk:doc:abc",
      caseId: "case-1",
      documentId: "doc-1",
      role: "reference_material",
      sectionPath: ["대학 목록", "서울"],
      text: "원문 대학 목록",
      sourceIds: ["src:doc-1:p1:e1"],
      pages: [1],
      contentHash: "abc123",
    };
    const representation = buildSearchDocument(chunk, {
      fileName: "대학목록.xlsx",
      role: "reference_material",
    });
    expect(representation.retrievalContext).toContain("reference_material");
    expect(representation.originalText).toBe("원문 대학 목록");
    expect(representation.metadata).not.toHaveProperty("sourceIds");
    expect(representation.markdown).toContain("## 원문\n\n원문 대학 목록");
  });
});
