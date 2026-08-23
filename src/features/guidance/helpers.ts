export function stripCitations(text: string): string {
  return text.replace(/【†\d+】/g, "").trim();
}

export function truncateList<T>(items: readonly T[], max = 4): T[] {
  return items.slice(0, max);
}
