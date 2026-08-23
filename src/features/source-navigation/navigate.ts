import { messaging } from "../../core/messaging/protocol";
import type { SourceRecord } from "../../core/evidence/types";

export interface SourceRegistry {
  get(
    sourceId: string
  ): SourceRecord | undefined | Promise<SourceRecord | undefined>;
}

export interface ViewerHost {
  selectDocument(documentId: string): void | Promise<void>;
  goToPage(page: number): Promise<void>;
  focusSource(source: SourceRecord): Promise<void>;
  outlineSelect(nodeId: string): void;
  accessibilityFocus(nodeId: string | undefined): void;
}

let activeRegistry: SourceRegistry | undefined;

export function setNavigationRegistry(registry: SourceRegistry): void {
  activeRegistry = registry;
}

export function getNavigationRegistry(): SourceRegistry | undefined {
  return activeRegistry;
}

export async function navigateToSource(
  sourceId: string,
  registry?: SourceRegistry,
  viewer?: ViewerHost
): Promise<void> {
  const target = registry ?? activeRegistry;
  if (!target) {
    throw new Error("No SourceRegistry available for navigation");
  }

  const source = await target.get(sourceId);
  if (!source) {
    if (viewer) return;
    throw new Error(`Source not found: ${sourceId}`);
  }

  if (!viewer) {
    await messaging.openViewer({
      caseId: source.caseId,
      documentId: source.documentId,
      sourceId: source.sourceId,
    });
    return;
  }

  await viewer.selectDocument(source.documentId);
  await viewer.goToPage(source.page);
  await viewer.focusSource(source);

  viewer.outlineSelect(source.semanticNodeId ?? source.sourceId);
  viewer.accessibilityFocus(source.semanticNodeId);
}
