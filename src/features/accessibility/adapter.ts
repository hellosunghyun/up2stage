import type { ParseElement, SourceRecord } from "../../models/canonical";
import { normalizeSemanticDocument, type SemanticRenderNode } from "../../renderers/semantic";

export interface AccessibleDocumentModel {
  nodes: SemanticRenderNode[];
  sourceByNodeId: Map<string, SourceRecord>;
}

function indexNodeSources(
  nodes: readonly SemanticRenderNode[],
  sources: ReadonlyMap<string, SourceRecord>,
  result: Map<string, SourceRecord>
): void {
  for (const node of nodes) {
    const source = sources.get(node.sourceId);
    if (source) result.set(node.id, source);
    if (node.children) indexNodeSources(node.children, sources, result);
  }
}

/** Parse와 Source Registry 사이의 연결만 담당하고 Source ID를 생성하거나 보정하지 않는다. */
export function buildAccessibleDocument(
  parseElements: readonly ParseElement[],
  sources: readonly SourceRecord[],
  documentId: string
): AccessibleDocumentModel {
  const documentSources = new Map(
    sources
      .filter((source) => source.documentId === documentId)
      .map((source) => [source.sourceId, source] as const)
  );
  const elements = parseElements.filter(
    (element) => element.documentId === documentId && documentSources.has(element.sourceId)
  );
  const nodes = normalizeSemanticDocument(elements);
  const sourceByNodeId = new Map<string, SourceRecord>();
  indexNodeSources(nodes, documentSources, sourceByNodeId);
  return { nodes, sourceByNodeId };
}
