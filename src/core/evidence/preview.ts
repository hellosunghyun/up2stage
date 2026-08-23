import type { SourcePreview, SourceRecord } from "./types";

const PREVIEW_MAX_LENGTH = 200;

export function formatSourcePreview(
  source: SourceRecord,
  fileName: string
): SourcePreview {
  const text =
    source.text.length > PREVIEW_MAX_LENGTH
      ? `${source.text.slice(0, PREVIEW_MAX_LENGTH).trim()}…`
      : source.text;

  return {
    fileName,
    page: source.page,
    text,
  };
}
