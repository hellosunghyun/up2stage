export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
