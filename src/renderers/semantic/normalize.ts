import DOMPurify from "dompurify";
import type { ParseElement } from "../../models/canonical";
import type {
  SemanticListItem,
  SemanticRenderNode,
  SemanticTableCell,
  SemanticTableRow,
  SemanticTableScope,
  SemanticTableSection
} from "./types";

const SAFE_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ol",
  "ul",
  "li",
  "table",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "br"
];

const ORDERED_MARKER = /^\s*(?:\d+[.)]|[①-⑳]|[가-하][.)])\s*/u;
const UNORDERED_MARKER = /^\s*(?:[-•·▪◦]|※)\s*/u;

function sanitizedRoot(html: string | undefined): HTMLElement | undefined {
  if (!html || typeof DOMParser === "undefined") return undefined;
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: SAFE_TAGS,
    ALLOWED_ATTR: ["scope", "rowspan", "colspan"]
  });
  const document = new DOMParser().parseFromString(sanitized, "text/html");
  return document.body.firstElementChild instanceof HTMLElement
    ? document.body.firstElementChild
    : undefined;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").replace(/\s+/gu, " ").trim();
}

function textWithBreaks(element: Element): string {
  const parts: string[] = [];
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? "");
    } else if (node instanceof HTMLBRElement) {
      parts.push("\n");
    } else if (node instanceof Element) {
      parts.push(textWithBreaks(node));
    }
  }
  return parts.join("").replace(/[\t ]+/gu, " ").replace(/\s*\n\s*/gu, "\n").trim();
}

function elementText(element: ParseElement, root: HTMLElement | undefined): string {
  return normalizeText(element.text) || normalizeText(root ? textWithBreaks(root) : undefined);
}

function headingLevel(element: ParseElement, root: HTMLElement | undefined): number {
  if (element.level) return Math.min(6, Math.max(1, element.level));
  const categoryLevel = /heading[^0-9]*([1-6])/iu.exec(element.category)?.[1];
  if (categoryLevel) return Number(categoryLevel);
  const tagLevel = /^H([1-6])$/u.exec(root?.tagName ?? "")?.[1];
  return tagLevel ? Number(tagLevel) : 2;
}

function listItems(element: ParseElement, root: HTMLElement | undefined): SemanticListItem[] {
  const nativeItems = root ? Array.from(root.querySelectorAll(":scope > li")) : [];
  const lines =
    nativeItems.length > 0
      ? nativeItems.map((item) => normalizeText(textWithBreaks(item)))
      : (root ? textWithBreaks(root) : element.text ?? "")
          .split(/\n+/u)
          .map((line) => normalizeText(line.replace(ORDERED_MARKER, "").replace(UNORDERED_MARKER, "")));

  return lines
    .filter(Boolean)
    .map((text, index) => ({ id: `${element.sourceId}:item:${index + 1}`, text }));
}

function listType(element: ParseElement, root: HTMLElement | undefined) {
  if (root?.tagName === "OL" || /ordered|numbered/iu.test(element.category)) {
    return "ordered-list" as const;
  }
  if (root?.tagName === "UL" || /unordered|bullet/iu.test(element.category)) {
    return "unordered-list" as const;
  }
  const firstLine = (root ? textWithBreaks(root) : element.text ?? "").split(/\n/u)[0] ?? "";
  return ORDERED_MARKER.test(firstLine) ? ("ordered-list" as const) : ("unordered-list" as const);
}

function tableSection(row: HTMLTableRowElement): SemanticTableSection {
  const parentTag = row.parentElement?.tagName;
  if (parentTag === "THEAD") return "head";
  if (parentTag === "TFOOT") return "foot";
  return "body";
}

function tableScope(cell: HTMLTableCellElement): SemanticTableScope | undefined {
  const scope = cell.getAttribute("scope");
  return scope === "col" || scope === "row" || scope === "colgroup" || scope === "rowgroup"
    ? scope
    : undefined;
}

function positiveSpan(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : undefined;
}

function tableRows(element: ParseElement, root: HTMLElement | undefined): SemanticTableRow[] {
  if (!(root instanceof HTMLTableElement)) return [];
  return Array.from(root.rows).map((row, rowIndex) => ({
    id: `${element.sourceId}:row:${rowIndex + 1}`,
    section: tableSection(row),
    cells: Array.from(row.cells).map(
      (cell, cellIndex): SemanticTableCell => ({
        id: `${element.sourceId}:row:${rowIndex + 1}:cell:${cellIndex + 1}`,
        text: normalizeText(textWithBreaks(cell)),
        header: cell.tagName === "TH",
        scope: tableScope(cell),
        colSpan: positiveSpan(cell.getAttribute("colspan")),
        rowSpan: positiveSpan(cell.getAttribute("rowspan"))
      })
    )
  }));
}

function normalizeElement(element: ParseElement): SemanticRenderNode | undefined {
  const root = sanitizedRoot(element.html);
  const text = elementText(element, root);
  const base = { id: element.sourceId, sourceId: element.sourceId };

  switch (element.type) {
    case "heading":
      return { ...base, type: "heading", level: headingLevel(element, root), text };
    case "paragraph":
    case "other":
      return text ? { ...base, type: "paragraph", text } : undefined;
    case "list": {
      const items = listItems(element, root);
      return items.length > 0 ? { ...base, type: listType(element, root), listItems: items } : undefined;
    }
    case "table": {
      const rows = tableRows(element, root);
      return {
        ...base,
        type: "table",
        text: rows.length === 0 ? text : undefined,
        tableCaption:
          root instanceof HTMLTableElement
            ? normalizeText(root.caption?.textContent ?? undefined) || undefined
            : undefined,
        tableRows: rows
      };
    }
    case "figure":
      // Parse figure text에는 AI 생성 이미지 설명이 섞일 수 있다. ParseElement만으로 원문
      // 여부를 증명할 수 없으므로 별도 caption node만 그림 설명으로 사용한다.
      return { ...base, type: "figure", text: "문서에 포함된 그림" };
    case "caption":
      return text ? { ...base, type: "caption", text } : undefined;
  }
}

export function normalizeSemanticDocument(elements: readonly ParseElement[]): SemanticRenderNode[] {
  const nodes = elements
    .map(normalizeElement)
    .filter((node): node is SemanticRenderNode => node !== undefined);
  const result: SemanticRenderNode[] = [];

  for (const node of nodes) {
    if (node.type === "caption") {
      const previous = result.at(-1);
      if (previous?.type === "figure") {
        previous.children = [...(previous.children ?? []), node];
        continue;
      }
    }
    result.push(node);
  }

  return result;
}
