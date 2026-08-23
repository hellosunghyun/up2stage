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

function inferFileNameFromText(text: string): string | undefined {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  for (const ext of SUPPORTED_EXTENSIONS) {
    if (lower.endsWith(`.${ext}`)) return trimmed;
  }
  const match = trimmed.match(new RegExp(`\\S+\\.(${SUPPORTED_EXTENSIONS.join("|")})$`, "i"));
  return match ? match[0] : undefined;
}

function collectCandidate(
  map: Map<string, DiscoveredAttachment>,
  rawUrl: string,
  element: Element,
  baseUrl: string
): void {
  if (!rawUrl) {
    console.log("[up2stage:discovery] skip empty rawUrl");
    return;
  }

  const absolute = toAbsoluteUrl(rawUrl, baseUrl);
  if (!absolute) {
    console.log("[up2stage:discovery] skip unresolvable rawUrl:", rawUrl);
    return;
  }

  const sourceElementText =
    (element as HTMLElement).innerText?.trim() ||
    (element as HTMLElement).textContent?.trim() ||
    element.getAttribute("title") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("download") ||
    "";

  const fileNameFromUrl = inferFileName(absolute);
  const fileNameFromText = inferFileNameFromText(sourceElementText);

  console.log("[up2stage:discovery] candidate", {
    rawUrl,
    absolute,
    sourceElementText,
    fileNameFromUrl,
    fileNameFromText,
  });

  let fileName = fileNameFromUrl;
  let extension = inferExtension(fileName);

  if (!extension && fileNameFromText) {
    fileName = fileNameFromText;
    extension = inferExtension(fileName);
  }

  if (!extension || !isSupportedExtension(extension)) {
    console.log("[up2stage:discovery] skip unsupported/no extension:", { fileName, extension });
    return;
  }

  const url = canonicalUrl(absolute);
  const key = `${url}::${fileName}`;
  if (map.has(key)) {
    console.log("[up2stage:discovery] skip duplicate:", key);
    return;
  }

  const attachment: DiscoveredAttachment = {
    id: makeId(map.size),
    url,
    fileName,
    extension,
    sourceElementText,
    selected: true,
    accessible: true,
  };

  console.log("[up2stage:discovery] found:", attachment);
  map.set(key, attachment);
}

export function discoverAttachments(baseUrl?: string): DiscoveredAttachment[] {
  const resolvedBase = baseUrl ?? window.location.href;
  console.log("[up2stage:discovery] start, baseUrl:", resolvedBase);

  const map = new Map<string, DiscoveredAttachment>();

  console.log("[up2stage:discovery] a[href] elements:", document.querySelectorAll("a[href]").length);
  document.querySelectorAll("a[href]").forEach((el) => {
    collectCandidate(map, el.getAttribute("href") ?? "", el, resolvedBase);
  });

  console.log("[up2stage:discovery] iframe[src] elements:", document.querySelectorAll("iframe[src]").length);
  document.querySelectorAll("iframe[src]").forEach((el) => {
    collectCandidate(map, el.getAttribute("src") ?? "", el, resolvedBase);
  });

  console.log("[up2stage:discovery] embed[src] elements:", document.querySelectorAll("embed[src]").length);
  document.querySelectorAll("embed[src]").forEach((el) => {
    collectCandidate(map, el.getAttribute("src") ?? "", el, resolvedBase);
  });

  console.log("[up2stage:discovery] object[data] elements:", document.querySelectorAll("object[data]").length);
  document.querySelectorAll("object[data]").forEach((el) => {
    collectCandidate(map, el.getAttribute("data") ?? "", el, resolvedBase);
  });

  console.log("[up2stage:discovery] button[data-url] elements:", document.querySelectorAll("button[data-url]").length);
  document.querySelectorAll("button[data-url]").forEach((el) => {
    const btn = el as HTMLButtonElement;
    collectCandidate(map, btn.dataset.url ?? "", el, resolvedBase);
  });

  const result = Array.from(map.values()).sort((a, b) =>
    a.fileName.localeCompare(b.fileName)
  );

  console.log("[up2stage:discovery] total found:", result.length);
  return result;
}
