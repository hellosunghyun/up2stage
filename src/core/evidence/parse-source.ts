import { buildSourceId } from "./source-id";
import type { ParseSourceOptions, SourceRecord } from "./types";

const VOID_TAGS = new Set([
  "br",
  "hr",
  "img",
  "input",
  "meta",
  "link",
  "area",
  "base",
  "col",
  "embed",
  "param",
  "source",
  "track",
  "wbr",
]);

interface RawElement {
  id: string;
  category: string;
  html: string;
  page: number;
  text: string;
}

interface PageBoundary {
  afterIndex: number;
  nextPage: number;
}

function extractAttr(attrs: string, name: string): string | undefined {
  const regex = new RegExp(
    `(?:\\s|^)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i"
  );
  const match = regex.exec(attrs);
  return match?.[1] ?? match?.[2];
}

function findClosingTag(html: string, tag: string, from: number) {
  const openRe = new RegExp(`<${tag}\\b`, "gi");
  const closeRe = new RegExp(`</${tag}>`, "gi");

  let depth = 0;
  let searchFrom = from;

  for (;;) {
    openRe.lastIndex = searchFrom;
    closeRe.lastIndex = searchFrom;

    const openMatch = openRe.exec(html);
    const closeMatch = closeRe.exec(html);

    if (!closeMatch) return undefined;
    if (!openMatch || closeMatch.index <= openMatch.index) {
      if (depth === 0) {
        return closeMatch.index + closeMatch[0].length;
      }
      depth--;
      searchFrom = closeMatch.index + closeMatch[0].length;
    } else {
      depth++;
      searchFrom = openMatch.index + openMatch[0].length;
    }
  }
}

function stripTags(html: string): string {
  const withNewlines = html.replace(/<br\s*\/?>/gi, "\n");
  return withNewlines
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findPageBoundaries(html: string): PageBoundary[] {
  const footerRe = /<footer\b[^>]*>([\s\S]*?)<\/footer>/gi;
  const pageMarkerRe = /^-\s*(\d+)\s*-$/;
  const boundaries: PageBoundary[] = [];

  let match;
  while ((match = footerRe.exec(html)) !== null) {
    const text = match[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
    const pageMatch = pageMarkerRe.exec(text);
    if (pageMatch) {
      const page = Number(pageMatch[1]);
      boundaries.push({ afterIndex: match.index + match[0].length, nextPage: page + 1 });
    }
  }

  return boundaries.sort((a, b) => a.afterIndex - b.afterIndex);
}

function parseDocument(html: string): RawElement[] {
  const startTagRe = /<([a-zA-Z][\w-]*)\b([^>]*)>/g;
  const boundaries = findPageBoundaries(html);

  const rawElements: RawElement[] = [];
  let currentPage = 1;
  let nextBoundaryIndex = 0;

  let match;
  while ((match = startTagRe.exec(html)) !== null) {
    const startIndex = match.index;
    const fullTag = match[0];
    const tag = match[1] ?? "";
    const attrs = match[2] ?? "";
    const tagEnd = startIndex + fullTag.length;

    while (nextBoundaryIndex < boundaries.length) {
      const boundary = boundaries[nextBoundaryIndex];
      if (!boundary || boundary.afterIndex > startIndex) break;
      currentPage = boundary.nextPage;
      nextBoundaryIndex++;
    }

    const dataPage = extractAttr(attrs, "data-page");
    if (dataPage) {
      currentPage = Number(dataPage);
    }

    if (tag === "footer") {
      const closeIndex = findClosingTag(html, tag, tagEnd);
      startTagRe.lastIndex = closeIndex ?? html.length;
      continue;
    }

    const id = extractAttr(attrs, "id");
    if (!id || VOID_TAGS.has(tag.toLowerCase())) {
      continue;
    }

    const isSelfClosing = fullTag.trimEnd().endsWith("/>");
    const closeIndex = isSelfClosing
      ? tagEnd
      : findClosingTag(html, tag, tagEnd);

    if (closeIndex === undefined) {
      continue;
    }

    const htmlSlice = html.slice(startIndex, closeIndex);
    const category = extractAttr(attrs, "data-category") ?? tag.toLowerCase();
    const text = stripTags(htmlSlice);

    rawElements.push({
      id,
      category,
      html: htmlSlice,
      page: extractAttr(attrs, "data-page")
        ? Number(extractAttr(attrs, "data-page"))
        : currentPage,
      text,
    });

    startTagRe.lastIndex = closeIndex;
  }

  return rawElements;
}

function normalizeElementId(id: string): string | number {
  return /^\d+$/.test(id) ? Number(id) : id;
}

export function buildSourcesFromParse({
  caseId,
  documentId,
  html,
}: ParseSourceOptions): SourceRecord[] {
  return parseDocument(html).map((el) => {
    const elementId = normalizeElementId(el.id);
    return {
      sourceId: buildSourceId(documentId, el.page, elementId),
      caseId,
      documentId,
      page: el.page,
      elementId,
      category: el.category,
      text: el.text,
      html: el.html,
    };
  });
}
