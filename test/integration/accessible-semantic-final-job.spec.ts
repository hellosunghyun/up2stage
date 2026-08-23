// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import finalRunFixture from "../fixtures/upstage/job_XHVD4hULc9tFatRSVr7Bgx.sample.json";
import { adaptAgentJob } from "../../src/core/agent/adapter";
import { agentJobSchema } from "../../src/core/agent/types";
import { buildAccessibleDocument } from "../../src/features/accessibility/adapter";
import type { DocumentRecord } from "../../src/models/canonical";
import type { SemanticRenderNode } from "../../src/renderers/semantic";

const CASE_ID = "case-semantic-final-job";
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
  id: `doc-${id ?? index}`,
  caseId: CASE_ID,
  fileName: fileName ?? "document",
  extension: extension ?? "",
  contentHash: `hash-${id ?? index}`,
  upstageFileId: FILE_IDS[index],
  renderType: extension === "xlsx" ? "xlsx" : extension === "hwp" ? "hwp" : "pdf",
  processingStatus: "uploaded",
  createdAt: 0
}));

function flatten(nodes: readonly SemanticRenderNode[]): SemanticRenderNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

describe("final v0.22 Job to Accessible Semantic View", () => {
  it("keeps every rendered semantic node connected to an existing SourceRecord", () => {
    const result = adaptAgentJob(
      agentJobSchema.parse(finalRunFixture),
      { id: CASE_ID },
      documents
    );
    const models = result.documents.map((document) =>
      buildAccessibleDocument(result.parseElements, result.sources, document.id)
    );
    const nodes = models.flatMap((model) => flatten(model.nodes));
    const sourceIds = new Set(result.sources.map((source) => source.sourceId));

    expect(nodes.length).toBeGreaterThan(20);
    expect(nodes.every((node) => sourceIds.has(node.sourceId))).toBe(true);
    expect(
      models.every((model) =>
        flatten(model.nodes).every((node) => model.sourceByNodeId.has(node.id))
      )
    ).toBe(true);
  });

  it("preserves real list and table structure without using figure AI text as a caption", () => {
    const result = adaptAgentJob(
      agentJobSchema.parse(finalRunFixture),
      { id: CASE_ID },
      documents
    );
    const nodes = result.documents.flatMap((document) =>
      flatten(buildAccessibleDocument(result.parseElements, result.sources, document.id).nodes)
    );
    const lists = nodes.filter(
      (node) => node.type === "ordered-list" || node.type === "unordered-list"
    );
    const tables = nodes.filter((node) => node.type === "table");
    const figures = nodes.filter((node) => node.type === "figure");

    expect(lists.some((node) => (node.listItems?.length ?? 0) > 1)).toBe(true);
    expect(tables.some((node) => (node.tableRows?.length ?? 0) > 1)).toBe(true);
    expect(
      tables.some((node) =>
        node.tableRows?.some((row) => row.cells.some((cell) => cell.header))
      )
    ).toBe(true);
    expect(figures.every((node) => node.text === "문서에 포함된 그림")).toBe(true);
  });
});
