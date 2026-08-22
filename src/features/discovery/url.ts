export function toAbsoluteUrl(raw: string, base: string): string | null {
  try {
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}

export function canonicalUrl(url: string): string {
  const u = new URL(url);
  u.hash = "";
  return u.href;
}
