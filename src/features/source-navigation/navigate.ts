import type { SourceRecord } from "../../models/source";

export interface SourceRegistry {
  get(sourceId: string): Promise<SourceRecord | undefined>;
}

export interface ViewerHost {
  selectDocument(documentId: string): void | Promise<void>;
  goToPage(page: number): Promise<void>;
  focusSource(source: SourceRecord): Promise<void>;
  outlineSelect(nodeId: string): void;
  accessibilityFocus(nodeId: string | undefined): void;
}

export async function navigateToSource(
  sourceId: string,
  sourceRegistry: SourceRegistry,
  viewer: ViewerHost
): Promise<void> {
  const source = await sourceRegistry.get(sourceId);
  if (!source) {
    return;
  }

  await viewer.selectDocument(source.documentId);
  await viewer.goToPage(source.page);
  await viewer.focusSource(source);

  viewer.outlineSelect(source.semanticNodeId ?? source.sourceId);
  viewer.accessibilityFocus(source.semanticNodeId);
}
