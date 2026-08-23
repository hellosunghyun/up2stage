import type { ExtractLocation, ExtractLocationMapping, SourceRecord } from "./types";

export function mapExtractToSources(
  sources: readonly SourceRecord[],
  location: ExtractLocation
): ExtractLocationMapping {
  const raw = location.rawValue.trim();
  if (!raw) {
    return { ...location, sourceIds: [], unresolved: true };
  }

  const normalized = raw.replace(/\s+/g, " ");

  const candidates = sources.filter((s) => {
    if (s.page !== location.page) return false;
    const text = s.text.replace(/\s+/g, " ");
    return text.includes(normalized);
  });

  const sourceIds = candidates.map((s) => s.sourceId);
  return {
    ...location,
    sourceIds,
    unresolved: sourceIds.length === 0,
  };
}
