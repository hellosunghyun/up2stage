import type { CitationResolution } from "./types";

const CITATION_RE = /【†(\d+)】/g;

export interface Sourced<T> {
  value: T;
  sourceIds: string[];
}

export function attachSources<T>(value: T, sourceIds: readonly string[]): Sourced<T> {
  return { value, sourceIds: [...new Set(sourceIds)] };
}

export function collectSourceIdsFromText(
  text: string,
  resolutions: readonly CitationResolution[]
): string[] {
  const ids = new Set<string>();

  let match;
  while ((match = CITATION_RE.exec(text)) !== null) {
    const index = Number(match[1]);
    const resolution = resolutions.find((r) => r.index === index);
    if (!resolution) continue;
    for (const id of resolution.sourceIds) {
      ids.add(id);
    }
  }

  return [...ids];
}
