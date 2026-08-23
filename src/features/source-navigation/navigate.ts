import { messaging } from "../../core/messaging/protocol";
import type { SourceRegistry } from "../../core/evidence/registry";

let activeRegistry: SourceRegistry | undefined;

export function setNavigationRegistry(registry: SourceRegistry): void {
  activeRegistry = registry;
}

export function getNavigationRegistry(): SourceRegistry | undefined {
  return activeRegistry;
}

export async function navigateToSource(
  sourceId: string,
  registry?: SourceRegistry
): Promise<void> {
  const target = registry ?? activeRegistry;
  if (!target) {
    throw new Error("No SourceRegistry available for navigation");
  }

  const source = target.get(sourceId);
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  await messaging.openViewer({
    caseId: source.caseId,
    documentId: source.documentId,
    sourceId: source.sourceId,
  });
}
