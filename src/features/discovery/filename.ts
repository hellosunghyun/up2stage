export function inferFileName(url: string): string {
  try {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname);
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
  } catch {
    return "";
  }
}

export function inferExtension(fileName: string): string | undefined {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) return undefined;
  return fileName.slice(dot + 1).toLowerCase();
}
