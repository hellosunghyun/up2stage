// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildAccessibleDocument } from "../../../src/features/accessibility";
import type { ParseElement, SourceRecord } from "../../../src/models/canonical";

const source: SourceRecord = {
  sourceId: "src:doc-1:p1:e1",
  caseId: "case-1",
  documentId: "doc-1",
  page: 1,
  elementId: "1",
  category: "heading1",
  text: "지원 자격",
  semanticNodeId: "src:doc-1:p1:e1"
};

const element: ParseElement = {
  id: "pe:src:doc-1:p1:e1",
  caseId: "case-1",
  documentId: "doc-1",
  sourceId: source.sourceId,
  elementId: "1",
  category: "heading1",
  type: "heading",
  page: 1,
  text: "지원 자격"
};

describe("Accessible Document adapter", () => {
  it("connects canonical Parse elements to existing SourceRecords", () => {
    const model = buildAccessibleDocument([element], [source], "doc-1");

    expect(model.nodes).toEqual([
      expect.objectContaining({ id: source.sourceId, sourceId: source.sourceId })
    ]);
    expect(model.sourceByNodeId.get(source.semanticNodeId ?? "")).toBe(source);
  });

  it("does not invent semantic nodes when a Parse element has no registered SourceRecord", () => {
    const model = buildAccessibleDocument([element], [], "doc-1");

    expect(model.nodes).toEqual([]);
    expect(model.sourceByNodeId.size).toBe(0);
  });
});
