import type { DiscoveredAttachment } from "./types";
import { canonicalUrl, toAbsoluteUrl } from "./url";
import { inferExtension, inferFileName } from "./filename";

export const SUPPORTED_EXTENSIONS = [
  "pdf",
  "hwp",
  "hwpx",
  "xlsx",
  "docx",
  "pptx",
];

function isSupportedExtension(extension: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

function makeId(index: number): string {
  return `discovered-${index}`;
}

function collectCandidate(
  map: Map<string, DiscoveredAttachment>,
  rawUrl: string,
  element: Element,
  baseUrl: string
): void {
  if (!rawUrl) return;

  const absolute = toAbsoluteUrl(rawUrl, baseUrl);
  if (!absolute) return;

  const fileName = inferFileName(absolute);
  const extension = inferExtension(fileName);
  if (!extension || !isSupportedExtension(extension)) return;

  const url = canonicalUrl(absolute);
  const key = `${url}::${fileName}`;
  if (map.has(key)) return;

  const sourceElementText =
    (element as HTMLElement).innerText?.trim() ||
    (element as HTMLElement).textContent?.trim() ||
    element.getAttribute("aria-label") ||
    "";

  map.set(key, {
    id: makeId(map.size),
    url,
    fileName,
    extension,
    sourceElementText,
    selected: true,
    accessible: true,
  });
}

export function discoverAttachments(baseUrl?: string): DiscoveredAttachment[] {
  const resolvedBase = baseUrl ?? window.location.href;
  const map = new Map<string, DiscoveredAttachment>();

  document.querySelectorAll("a[href]").forEach((el) => {
    collectCandidate(map, el.getAttribute("href") ?? "", el, resolvedBase);
  });

  document.querySelectorAll("iframe[src]").forEach((el) => {
    collectCandidate(map, el.getAttribute("src") ?? "", el, resolvedBase);
  });

  document.querySelectorAll("embed[src]").forEach((el) => {
    collectCandidate(map, el.getAttribute("src") ?? "", el, resolvedBase);
  });

  document.querySelectorAll("object[data]").forEach((el) => {
    collectCandidate(map, el.getAttribute("data") ?? "", el, resolvedBase);
  });

  document.querySelectorAll("button[data-url]").forEach((el) => {
    const btn = el as HTMLButtonElement;
    collectCandidate(map, btn.dataset.url ?? "", el, resolvedBase);
  });

  return Array.from(map.values()).sort((a, b) =>
    a.fileName.localeCompare(b.fileName)
  );
}
