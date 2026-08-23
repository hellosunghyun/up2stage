import type { QuickQuestion } from "../../core/decision/types";

const ALIASES: Record<string, string> = {
  campus_location_seoul: "university_location_type",
  school_location: "university_location_type",
  is_seoul_citizen_or_household_member: "seoul_residency_condition",
};

function normalizeKey(key: string): string {
  const lowered = key.trim().toLowerCase();
  return (ALIASES[lowered] ?? lowered).replace(/-/g, "_");
}

function originPriority(a: QuickQuestion["origin"]): number {
  return a === "primary_notice" ? 1 : 0;
}

export function dedupeQuickQuestions(questions: QuickQuestion[]): QuickQuestion[] {
  const groups = new Map<string, QuickQuestion[]>();

  for (const q of questions) {
    const key = normalizeKey(q.key);
    const existing = groups.get(key) ?? [];
    existing.push(q);
    groups.set(key, existing);
  }

  const result: QuickQuestion[] = [];
  for (const [, items] of groups) {
    const winner = items.reduce((prev, current) => {
      if (originPriority(current.origin) > originPriority(prev.origin)) {
        return current;
      }
      if (
        originPriority(current.origin) === originPriority(prev.origin) &&
        current.id.localeCompare(prev.id) < 0
      ) {
        return current;
      }
      return prev;
    }, items[0]!);
    result.push(winner);
  }

  return result;
}
