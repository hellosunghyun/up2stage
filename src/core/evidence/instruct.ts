import type { CitationResolution, InstructCitation, ExtractLocationMapping } from "./types";

export function resolveInstructCitations(
  citations: readonly InstructCitation[],
  extractMap: ReadonlyMap<string, ExtractLocationMapping>
): CitationResolution[] {
  return citations.map((citation) => {
    const mapping = extractMap.get(citation.sourceRef);
    const unresolved = !mapping || mapping.unresolved;
    return {
      index: citation.index,
      sourceIds: mapping?.sourceIds ?? [],
      unresolved,
    };
  });
}
