import type {
  QuestionInputType,
  QuestionOrigin,
  QuickQuestionRecord,
} from "../../models/canonical";

const VALID_TYPES: readonly QuestionInputType[] = [
  "text",
  "number",
  "select",
  "boolean",
  "date",
  "organization_select",
];

const PART_KEYS = ["key", "label", "type", "required", "options", "rule"] as const;
type PartKey = (typeof PART_KEYS)[number];

const ALIASES: Record<string, string> = {
  campus_location_seoul: "university_location_type",
  school_location: "university_location_type",
  is_seoul_citizen_or_household_member: "is_seoul_citizen_or_child",
};

function splitCompactLine(line: string): Record<PartKey, string | undefined> {
  const result: Record<PartKey, string | undefined> = {
    key: undefined,
    label: undefined,
    type: undefined,
    required: undefined,
    options: undefined,
    rule: undefined,
  };

  for (const segment of line.split(" | ")) {
    const firstEqual = segment.indexOf("=");
    if (firstEqual < 0) continue;
    const key = segment.slice(0, firstEqual).trim() as PartKey;
    if (!PART_KEYS.includes(key)) continue;
    result[key] = segment.slice(firstEqual + 1).trim();
  }
  return result;
}

function normalizeKey(key: string): string {
  const lowered = key.trim().toLowerCase().replace(/-/g, "_");
  return ALIASES[lowered] ?? lowered;
}

export function parseCanonicalQuickQuestion(options: {
  caseId: string;
  source: string;
  origin: QuestionOrigin;
  index: number;
  sourceIds?: readonly string[];
}): QuickQuestionRecord {
  const parts = splitCompactLine(options.source);
  const rawKey = parts.key?.trim() || `unknown_${options.origin}_${options.index}`;
  const key = normalizeKey(rawKey);
  const rawType = parts.type?.trim() ?? "text";
  const inputType = VALID_TYPES.includes(rawType as QuestionInputType)
    ? (rawType as QuestionInputType)
    : "text";
  const optionValues = parts.options
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const ruleText = parts.rule?.trim();

  return {
    id: `qq:${options.caseId}:${options.origin}:${key}`,
    caseId: options.caseId,
    key,
    label: parts.label?.trim() || key,
    inputType,
    required: parts.required?.trim().toLowerCase() === "true",
    ...(optionValues && optionValues.length > 0 ? { options: optionValues } : {}),
    ...(ruleText ? { ruleText } : {}),
    sourceIds: [...new Set(options.sourceIds ?? [])],
    origin: options.origin,
  };
}

function originPriority(origin: QuestionOrigin): number {
  return origin === "primary_notice" ? 1 : 0;
}

export function dedupeCanonicalQuickQuestions(
  questions: readonly QuickQuestionRecord[]
): QuickQuestionRecord[] {
  const byKey = new Map<string, QuickQuestionRecord>();

  for (const question of questions) {
    const key = normalizeKey(question.key);
    const current = byKey.get(key);
    if (!current || originPriority(question.origin) > originPriority(current.origin)) {
      byKey.set(key, { ...question, key });
      continue;
    }
    if (originPriority(question.origin) === originPriority(current.origin)) {
      byKey.set(key, {
        ...current,
        sourceIds: [...new Set([...current.sourceIds, ...question.sourceIds])],
      });
    }
  }

  return [...byKey.values()];
}
