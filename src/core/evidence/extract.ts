import type { ExtractLocation, ExtractLocationMapping, SourceRecord } from "./types";

const WHITESPACE_RE = /\s+/g;
const INVISIBLE_RE = /[\u200B-\u200D\uFEFF]/g;

function normalizeWhitespace(value: string): string {
  return value.replace(WHITESPACE_RE, " ").trim();
}

function compact(value: string): string {
  return value.replace(WHITESPACE_RE, "").replace(INVISIBLE_RE, "");
}

function matchesSource(raw: string, sourceText: string): boolean {
  const normalizedText = normalizeWhitespace(sourceText);
  const normalizedRaw = normalizeWhitespace(raw);
  if (normalizedText.includes(normalizedRaw)) return true;

  const compactText = compact(sourceText);
  const compactRaw = compact(raw);
  return compactText.includes(compactRaw) && compactRaw.length > 0;
}

export function mapExtractToSources(
  sources: readonly SourceRecord[],
  location: ExtractLocation
): ExtractLocationMapping {
  const raw = location.rawValue.trim();
  if (!raw) {
    return { ...location, sourceIds: [], unresolved: true };
  }

  let candidates = sources.filter((s) => {
    if (s.page !== location.page) return false;
    return matchesSource(raw, s.text);
  });

  if (candidates.length === 0) {
    const crossPage = sources
      .filter((source) => matchesSource(raw, source.text))
      .sort((a, b) => a.text.length - b.text.length);
    const shortest = crossPage[0]?.text.length;
    candidates =
      shortest === undefined
        ? []
        : crossPage.filter((source) => source.text.length === shortest);
  }

  const sourceIds = candidates.map((s) => s.sourceId);
  return {
    ...location,
    sourceIds,
    unresolved: sourceIds.length === 0,
  };
}
