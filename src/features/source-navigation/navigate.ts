import { messaging } from "../../core/messaging/protocol";
import type { SourceRegistry } from "../../core/evidence/registry";

export async function navigateToSource(
  sourceId: string,
  registry: SourceRegistry
): Promise<void> {
  const source = registry.get(sourceId);
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  await messaging.openViewer({
    caseId: source.caseId,
    documentId: source.documentId,
    sourceId: source.sourceId,
  });
}
