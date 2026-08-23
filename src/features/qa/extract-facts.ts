import type { ExtractRecord } from "../../models/canonical";
import type { ExtractFact } from "../../core/solar";

function terms(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((term) => term.length >= 2)
  );
}

export function selectRelevantExtractFacts(
  question: string,
  extracts: readonly ExtractRecord[],
  limit = 12
): ExtractFact[] {
  const queryTerms = terms(question);
  return extracts
    .flatMap((extract) =>
      extract.values.map((value) => ({
        field: `${extract.schemaName}.${value.field}`,
        value: value.value,
        score: [...terms(`${value.field} ${value.value}`)].filter((term) => queryTerms.has(term))
          .length,
      }))
    )
    .filter((fact) => fact.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ field, value }) => ({ field, value }));
}
