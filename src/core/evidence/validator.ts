import type { SourceRegistry } from "./registry";
import type { EvidenceValidationResult } from "./types";

export interface EvidenceValidatorInput {
  sourceIds: readonly string[];
  currentCaseId: string;
  documentIds: readonly string[];
  registry: SourceRegistry;
  allowedSourceIds?: readonly string[];
  requireEvidence?: boolean;
}

export function validateEvidenceSourceIds({
  sourceIds,
  currentCaseId,
  documentIds,
  registry,
  allowedSourceIds,
  requireEvidence = false,
}: EvidenceValidatorInput): EvidenceValidationResult {
  const valid: string[] = [];
  const invalid: string[] = [];
  const allowed = allowedSourceIds ? new Set(allowedSourceIds) : undefined;

  for (const sourceId of new Set(sourceIds)) {
    if (allowed && !allowed.has(sourceId)) {
      invalid.push(sourceId);
      continue;
    }
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

  return {
    valid,
    invalid,
    insufficient: valid.length === 0 && (requireEvidence || sourceIds.length > 0),
  };
}
