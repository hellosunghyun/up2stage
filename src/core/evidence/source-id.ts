import type { SourceRecord } from "./types";

export function buildSourceId(
  documentId: string,
  page: number,
  elementId: string | number
): string {
  return `src:${documentId}:p${page}:e${elementId}`;
}

const SOURCE_ID_RE = /^src:([^:]+):p(\d+):e(.+)$/;

export function parseSourceId(
  sourceId: string
): Pick<SourceRecord, "documentId" | "page" | "elementId"> | undefined {
  const match = SOURCE_ID_RE.exec(sourceId);
  if (!match) return undefined;

  const [, documentId, pageText, elementIdText] = match;
  if (!documentId || !pageText || !elementIdText) return undefined;

  const page = Number(pageText);
  const elementId = /^\d+$/.test(elementIdText)
    ? Number(elementIdText)
    : elementIdText;

  return { documentId, page, elementId };
}
