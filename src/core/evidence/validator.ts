import type { SourceRegistry } from "./registry";
import type { EvidenceValidationResult } from "./types";

export interface EvidenceValidatorInput {
  sourceIds: readonly string[];
  currentCaseId: string;
  documentIds: readonly string[];
  registry: SourceRegistry;
}

export function validateEvidenceSourceIds({
  sourceIds,
  currentCaseId,
  documentIds,
  registry,
}: EvidenceValidatorInput): EvidenceValidationResult {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const sourceId of sourceIds) {
    const source = registry.get(sourceId);
    if (!source) {
      invalid.push(sourceId);
      continue;
    }

    const belongsToCase = source.caseId === currentCaseId;
    const documentExists = documentIds.includes(source.documentId);
    const pageValid = Number.isInteger(source.page) && source.page > 0;

    if (belongsToCase && documentExists && pageValid) {
      valid.push(sourceId);
    } else {
      invalid.push(sourceId);
    }
  }

  return { valid, invalid, insufficient: valid.length === 0 && sourceIds.length > 0 };
}
