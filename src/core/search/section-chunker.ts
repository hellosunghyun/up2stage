import type { ChunkRecord, ParseElement, SourceRecord } from "../../models/canonical";
import { sha256 } from "../../utils/hash";
import type { ChunkingLimits, SectionChunkerInput } from "./types";

export const DEFAULT_CHUNKING_LIMITS: ChunkingLimits = {
  targetTokens: 700,
  maxTokens: 1200,
  minTokens: 180,
  overlapTokens: 120,
};

const NUMBERED_STRUCTURE_RE = /^(?:\d+(?:-\d+)*[.)]|[가-힣][.)]|[①-⑳]|제\s*\d+\s*조(?:의\s*\d+)?|붙임(?:\s*\d+)?)\s*/;
const HANGUL_RE = /[가-힣]/g;
const LATIN_WORD_RE = /[A-Za-z0-9]+/g;

interface ChunkElement {
  parseElement: ParseElement;
  source: SourceRecord;
  text: string;
  tokens: number;
  boundary: "heading" | "numbered" | "table-list" | "none";
}

interface PendingChunk {
  elements: ChunkElement[];
  sectionPath: string[];
  tokens: number;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function estimateTokens(text: string): number {
  const hangul = text.match(HANGUL_RE)?.length ?? 0;
  const latin = (text.match(LATIN_WORD_RE) ?? []).reduce(
    (total, word) => total + Math.max(1, Math.ceil(word.length / 4)),
    0
  );
  const other = text
    .replace(HANGUL_RE, "")
    .replace(LATIN_WORD_RE, "")
    .replace(/\s/g, "").length;
  return Math.max(1, hangul + latin + Math.ceil(other / 2));
}

function numberedDepth(text: string): number {
  const match = NUMBERED_STRUCTURE_RE.exec(text);
  if (!match) return 1;
  const marker = match[0].trim();
  const numeric = /^(\d+(?:-\d+)*)/.exec(marker)?.[1];
  return numeric ? numeric.split("-").length : 1;
}

function classifyBoundary(element: ParseElement, text: string): ChunkElement["boundary"] {
  if (element.type === "heading" || element.category.startsWith("heading")) {
    return "heading";
  }
  if (NUMBERED_STRUCTURE_RE.test(text)) return "numbered";
  if (element.type === "table" || element.type === "list") return "table-list";
  return "none";
}

function splitTextAtTokenLimit(text: string, maxTokens: number): string[] {
  const parts: string[] = [];
  let remaining = text;
  while (estimateTokens(remaining) > maxTokens) {
    let low = 1;
    let high = remaining.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (estimateTokens(remaining.slice(0, middle)) <= maxTokens) low = middle;
      else high = middle - 1;
    }
    const minimumBreakpoint = Math.floor(low * 0.7);
    let cut = low;
    for (let index = low; index >= minimumBreakpoint; index--) {
      if (/[\s.!?。！？;；]/.test(remaining[index - 1] ?? "")) {
        cut = index;
        break;
      }
    }
    const part = normalizeText(remaining.slice(0, cut));
    if (part) parts.push(part);
    remaining = remaining.slice(cut).trimStart();
  }
  const tail = normalizeText(remaining);
  if (tail) parts.push(tail);
  return parts;
}

function splitOversizedElement(
  element: ChunkElement,
  maxTokens: number
): ChunkElement[] {
  if (element.tokens <= maxTokens) return [element];
  return splitTextAtTokenLimit(element.text, maxTokens).map((text, index) => ({
    ...element,
    text,
    tokens: estimateTokens(text),
    boundary: index === 0 ? element.boundary : "none",
  }));
}

function updateSectionPath(
  current: readonly string[],
  element: ChunkElement
): string[] {
  const label = normalizeText(element.text).slice(0, 160);
  if (element.boundary === "heading") {
    const level = Math.max(1, element.parseElement.level ?? 1);
    return [...current.slice(0, level - 1), label];
  }
  if (element.boundary === "numbered") {
    const depth = numberedDepth(element.text);
    return [...current.slice(0, depth), label];
  }
  return [...current];
}

function tailForOverlap(
  elements: readonly ChunkElement[],
  overlapTokens: number
): ChunkElement[] {
  const tail: ChunkElement[] = [];
  let tokens = 0;
  for (let index = elements.length - 1; index >= 0; index--) {
    const element = elements[index];
    if (!element || element.boundary !== "none") break;
    tail.unshift(element);
    tokens += element.tokens;
    if (tokens >= overlapTokens) break;
  }
  return tail;
}

async function finalizeChunk(input: {
  caseId: string;
  documentId: string;
  role: SectionChunkerInput["document"]["role"];
  pending: PendingChunk;
}): Promise<ChunkRecord | undefined> {
  if (input.pending.elements.length === 0) return undefined;
  const text = input.pending.elements.map((element) => element.text).join("\n\n");
  const sourceIds = [...new Set(input.pending.elements.map((element) => element.source.sourceId))];
  const pages = [...new Set(input.pending.elements.map((element) => element.source.page))].sort(
    (a, b) => a - b
  );
  const contentHash = await sha256(
    new TextEncoder().encode(`${text}\n${sourceIds.join("\n")}`)
  );
  return {
    id: `chunk:${input.documentId}:${contentHash.slice(0, 20)}`,
    caseId: input.caseId,
    documentId: input.documentId,
    ...(input.role ? { role: input.role } : {}),
    sectionPath: input.pending.sectionPath,
    text,
    sourceIds,
    pages,
    contentHash,
  };
}

function mergeSmallChunks(chunks: PendingChunk[], minTokens: number): PendingChunk[] {
  const merged: PendingChunk[] = [];
  for (const chunk of chunks) {
    const previous = merged.at(-1);
    if (
      previous &&
      chunk.tokens < minTokens &&
      previous.tokens < minTokens &&
      previous.sectionPath.join("\u0000") === chunk.sectionPath.join("\u0000")
    ) {
      previous.elements.push(...chunk.elements);
      previous.tokens += chunk.tokens;
    } else {
      merged.push(chunk);
    }
  }
  return merged;
}

export async function chunkDocument({
  caseId,
  document,
  parseElements,
  sources,
  limits: overrides,
}: SectionChunkerInput): Promise<ChunkRecord[]> {
  const limits = { ...DEFAULT_CHUNKING_LIMITS, ...overrides };
  if (limits.targetTokens > limits.maxTokens || limits.overlapTokens >= limits.maxTokens) {
    throw new Error("Invalid SectionChunker token limits");
  }

  const sourceById = new Map(
    sources
      .filter((source) => source.caseId === caseId && source.documentId === document.id)
      .map((source) => [source.sourceId, source])
  );
  const elements: ChunkElement[] = parseElements
    .filter((element) => element.caseId === caseId && element.documentId === document.id)
    .map((parseElement) => {
      const source = sourceById.get(parseElement.sourceId);
      if (!source) {
        throw new Error(`Source Registry에 없는 Parse Element입니다: ${parseElement.sourceId}`);
      }
      const text = normalizeText(parseElement.text ?? source.text);
      return {
        parseElement,
        source,
        text,
        tokens: estimateTokens(text),
        boundary: classifyBoundary(parseElement, text),
      };
    })
    .flatMap((element) => splitOversizedElement(element, limits.maxTokens))
    .filter((element) => element.text.length > 0);

  const pendingChunks: PendingChunk[] = [];
  let sectionPath: string[] = [];
  let pending: PendingChunk = { elements: [], sectionPath: [], tokens: 0 };

  const flush = (withOverlap: boolean) => {
    if (pending.elements.length === 0) return;
    pendingChunks.push(pending);
    const overlap = withOverlap
      ? tailForOverlap(pending.elements, limits.overlapTokens)
      : [];
    pending = {
      elements: overlap,
      sectionPath: [...sectionPath],
      tokens: overlap.reduce((total, element) => total + element.tokens, 0),
    };
  };

  for (const element of elements) {
    const isStrongBoundary = element.boundary === "heading" || element.boundary === "numbered";
    const isTableListBoundary =
      element.boundary === "table-list" &&
      pending.elements.at(-1)?.boundary !== "table-list";

    if ((isStrongBoundary || isTableListBoundary) && pending.elements.length > 0) {
      flush(false);
    }

    if (isStrongBoundary) {
      sectionPath = updateSectionPath(sectionPath, element);
      pending.sectionPath = [...sectionPath];
    } else if (pending.elements.length === 0) {
      pending.sectionPath = [...sectionPath];
    }

    if (
      pending.elements.length > 0 &&
      pending.tokens + element.tokens > limits.maxTokens
    ) {
      flush(true);
      pending.sectionPath = [...sectionPath];
    }

    pending.elements.push(element);
    pending.tokens += element.tokens;

    if (pending.tokens >= limits.targetTokens && element.boundary === "none") {
      flush(true);
    }
  }
  flush(false);

  const merged = mergeSmallChunks(pendingChunks, limits.minTokens);
  const chunks = await Promise.all(
    merged.map((item) =>
      finalizeChunk({
        caseId,
        documentId: document.id,
        role: document.role,
        pending: item,
      })
    )
  );
  return chunks.filter((chunk): chunk is ChunkRecord => chunk !== undefined);
}

export async function chunkDocuments(input: {
  caseId: string;
  documents: readonly SectionChunkerInput["document"][];
  parseElements: readonly ParseElement[];
  sources: readonly SourceRecord[];
  limits?: Partial<ChunkingLimits>;
}): Promise<ChunkRecord[]> {
  const chunks = await Promise.all(
    input.documents.map((document) =>
      chunkDocument({
        caseId: input.caseId,
        document,
        parseElements: input.parseElements,
        sources: input.sources,
        ...(input.limits ? { limits: input.limits } : {}),
      })
    )
  );
  return chunks.flat();
}
