import {
  type QuickQuestion,
  type QuestionInputType,
  type QuestionOrigin,
} from "../../core/decision/types";

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

function splitCompactLine(line: string): Record<PartKey, string | undefined> {
  const result: Record<PartKey, string | undefined> = {
    key: undefined,
    label: undefined,
    type: undefined,
    required: undefined,
    options: undefined,
    rule: undefined,
  };

  const segments = line.split(" | ");
  for (const segment of segments) {
    const firstEqual = segment.indexOf("=");
    if (firstEqual < 0) continue;
    const key = segment.slice(0, firstEqual).trim() as PartKey;
    if (!PART_KEYS.includes(key)) continue;
    const value = segment.slice(firstEqual + 1).trim();
    result[key] = value;
  }

  return result;
}

export function parseQuickQuestion(
  source: string,
  origin: QuestionOrigin,
  index: number
): QuickQuestion {
  const parts = splitCompactLine(source);

  const key = parts.key?.trim() ?? `unknown_${origin}_${index}`;
  const label = parts.label?.trim() ?? key;

  const rawType = parts.type?.trim() ?? "text";
  const inputType: QuestionInputType = VALID_TYPES.includes(
    rawType as QuestionInputType
  )
    ? (rawType as QuestionInputType)
    : "text";

  const required = parts.required?.trim().toLowerCase() === "true";

  const optionsRaw = parts.options?.trim();
  const options: string[] | undefined =
    optionsRaw && optionsRaw.length > 0
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

  const ruleText = parts.rule?.trim();

  const base = {
    id: `${origin}_${key}_${index}`,
    key,
    label,
    inputType,
    required,
    origin,
  };

  return {
    ...base,
    ...(options && options.length > 0 ? { options } : {}),
    ...(ruleText ? { ruleText } : {}),
  };
}

export function parseQuickQuestions(
  lines: readonly string[],
  origin: QuestionOrigin
): QuickQuestion[] {
  return lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return null;
      try {
        return parseQuickQuestion(trimmed, origin, index);
      } catch {
        return {
          id: `${origin}_fallback_${index}`,
          key: `fallback_${index}`,
          label: trimmed,
          inputType: "text",
          required: false,
          origin,
        };
      }
    })
    .filter((q): q is QuickQuestion => q !== null);
}
