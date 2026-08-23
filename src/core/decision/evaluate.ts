import {
  type QuickQuestion,
  type UserAnswer,
  type RuleEvaluation,
  type DecisionResult,
  type DecisionStatus,
} from "./types";

function parseKoreanDate(input: string): Date | undefined {
  const normalized = input
    .replace(/[\s.-]/g, ".")
    .replace(/\(\.?[월화수목금토일]\)?/g, "")
    .replace(/\.$/, "")
    .trim();

  const patterns = [
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2}):(\d{2})/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s+(\d{1,2}):(\d{2})/,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
  ];

  for (const pattern of patterns) {
    const m = normalized.match(pattern);
    if (m) {
      const [, y, mo, d, h = "0", mi = "0"] = m as unknown as [
        string,
        string,
        string,
        string,
        string | undefined,
        string | undefined,
      ];
      const date = new Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi)
      );
      if (!isNaN(date.getTime())) return date;
    }
  }
  return undefined;
}

interface ParsedThreshold {
  kind: "at_least" | "at_most" | "equal";
  value: number;
}

function parseThreshold(ruleText: string): ParsedThreshold | undefined {
  const numberMatch = ruleText.match(
    /(\d+)(?:\s*(?:점|구간|학년|학기|페이지|자리))/
  );
  if (!numberMatch) return undefined;

  const value = Number(numberMatch[1]);
  if (Number.isNaN(value)) return undefined;

  if (/(이상|초과\s*아님|≥|>=)/.test(ruleText)) {
    return { kind: "at_least", value };
  }
  if (/(이하|미만\s*아님|≤|<=)/.test(ruleText)) {
    return { kind: "at_most", value };
  }
  if (/(초과|>|超过)/.test(ruleText)) {
    return { kind: "at_least", value: value + 1 };
  }
  if (/(미만|<|少于)/.test(ruleText)) {
    return { kind: "at_most", value: value - 1 };
  }

  if (/(\d+)(?:학년|학기|페이지)/.test(ruleText)) {
    return { kind: "equal", value };
  }

  return undefined;
}

function expectedBooleanAnswer(ruleText: string): boolean {
  const negative =
    /(없(어|을)\s*것|없어야|아닌\s*자|아니어야|불가|제외|해당\s*안\s*됨|해당\s*없음)/.test(
      ruleText
    );
  return !negative;
}

function expectedSelectKeywords(ruleText: string): string[] {
  const withoutParens = ruleText.replace(/\([^)]*\)/g, "");
  const segments = withoutParens
    .split(/[,|/·]|또는|또는\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return segments.filter(
    (s) => !/(해당\s*없음|제외|불가)/.test(s) && s.length > 1
  );
}

function findDeadline(ruleText: string): Date | undefined {
  const dateMatches = ruleText.match(
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\.(?:\d{1,2}:\d{2})?/g
  );
  if (!dateMatches || dateMatches.length === 0) return undefined;
  const candidate = parseKoreanDate(dateMatches[dateMatches.length - 1]!);
  return candidate;
}

function formatInput(input: UserAnswer): string {
  if (input === null) return "미입력";
  if (typeof input === "boolean") return input ? "예" : "아니오";
  return String(input);
}

function buildEvaluation(
  question: QuickQuestion,
  answer: UserAnswer,
  status: RuleEvaluation["status"],
  reason: string
): RuleEvaluation {
  const base: RuleEvaluation = {
    questionId: question.id,
    questionKey: question.key,
    label: question.label,
    input: answer,
    criterion: question.ruleText ?? "",
    status,
    reason,
  };
  return question.sourceIds
    ? { ...base, sourceIds: question.sourceIds }
    : base;
}

export function evaluateQuestion(
  question: QuickQuestion,
  answer: UserAnswer
): RuleEvaluation {
  if (answer === null) {
    return buildEvaluation(
      question,
      answer,
      "needs_more_information",
      "아직 입력하지 않았어요."
    );
  }

  const ruleText = question.ruleText ?? "";

  switch (question.inputType) {
    case "number": {
      const threshold = parseThreshold(ruleText);
      if (threshold === undefined) {
        return buildEvaluation(
          question,
          answer,
          "needs_more_information",
          "숫자 조건을 확인할 수 없어요."
        );
      }
      const raw = typeof answer === "number" ? answer : Number(answer);
      if (Number.isNaN(raw)) {
        return buildEvaluation(
          question,
          answer,
          "needs_more_information",
          "숫자 값이 아니에요."
        );
      }
      const num = raw;

      if (threshold.kind === "at_least") {
        return num >= threshold.value
          ? buildEvaluation(
              question,
              answer,
              "pass",
              `입력 ${num} ≥ 기준 ${threshold.value}`
            )
          : buildEvaluation(
              question,
              answer,
              "fail",
              `입력 ${num} < 기준 ${threshold.value}`
            );
      }

      if (threshold.kind === "at_most") {
        return num <= threshold.value
          ? buildEvaluation(
              question,
              answer,
              "pass",
              `입력 ${num} ≤ 기준 ${threshold.value}`
            )
          : buildEvaluation(
              question,
              answer,
              "fail",
              `입력 ${num} > 기준 ${threshold.value}`
            );
      }

      return num === threshold.value
        ? buildEvaluation(
            question,
            answer,
            "pass",
            `입력 ${num} = 기준 ${threshold.value}`
          )
        : buildEvaluation(
            question,
            answer,
            "fail",
            `입력 ${num} ≠ 기준 ${threshold.value}`
          );
    }

    case "boolean": {
      const expected = expectedBooleanAnswer(ruleText);
      const bool = typeof answer === "boolean" ? answer : answer === "true";
      return bool === expected
        ? buildEvaluation(
            question,
            answer,
            "pass",
            `입력 ${formatInput(bool)} = 기준 ${formatInput(expected)}`
          )
        : buildEvaluation(
            question,
            answer,
            "fail",
            `입력 ${formatInput(bool)} ≠ 기준 ${formatInput(expected)}`
          );
    }

    case "select": {
      const selected = String(answer).trim();
      const keywords = expectedSelectKeywords(ruleText);

      if (keywords.length === 0) {
        return buildEvaluation(
          question,
          answer,
          "needs_more_information",
          "선택 기준을 파악하지 못했어요."
        );
      }

      const hasIneligiblePattern = /(해당\s*없음|해당안됨|제외)/.test(selected);
      if (hasIneligiblePattern) {
        return buildEvaluation(
          question,
          answer,
          "fail",
          "선택 항목이 지원 조건에 해당하지 않아요."
        );
      }

      const matched = keywords.some(
        (k) => selected.includes(k) || k.includes(selected)
      );
      return matched
        ? buildEvaluation(
            question,
            answer,
            "pass",
            `입력 ${selected} 가(이) 기준에 맞아요.`
          )
        : buildEvaluation(
            question,
            answer,
            "fail",
            `입력 ${selected} 가(이) 기준에 맞지 않아요.`
          );
    }

    case "date": {
      const deadline = findDeadline(ruleText);
      const userDate = parseKoreanDate(String(answer));
      if (deadline === undefined || userDate === undefined) {
        return buildEvaluation(
          question,
          answer,
          "needs_more_information",
          "날짜 비교를 위한 정보가 부족해요."
        );
      }
      const before = userDate.getTime() <= deadline.getTime();
      return before
        ? buildEvaluation(question, answer, "pass", "마감 전이에요.")
        : buildEvaluation(question, answer, "fail", "마감 이후예요.");
    }

    case "text":
    case "organization_select": {
      if (ruleText.length === 0) {
        return buildEvaluation(
          question,
          answer,
          "needs_more_information",
          "아직 입력 기준을 확인할 수 없어요."
        );
      }
      return answer !== ""
        ? buildEvaluation(question, answer, "pass", "입력이 확인되었어요.")
        : buildEvaluation(
            question,
            answer,
            "needs_more_information",
            "아직 입력하지 않았어요."
          );
    }
    default: {
      const _exhaustive: never = question.inputType;
      throw new Error(`Unknown input type: ${String(_exhaustive)}`);
    }
  }
}

export function evaluateDecision(
  questions: QuickQuestion[],
  answers: Record<string, UserAnswer>
): DecisionResult {
  const breakdown = questions.map((q) =>
    evaluateQuestion(q, answers[q.id] ?? null)
  );

  if (breakdown.some((r) => r.status === "conflict")) {
    return {
      status: "conflict",
      overallReason: "문서 간 안내가 서로 달라 확인이 필요해요.",
      breakdown,
    };
  }
  if (breakdown.some((r) => r.status === "fail")) {
    return {
      status: "ineligible",
      overallReason: "현재 입력 기준으로 충족하지 않는 조건이 있어요.",
      breakdown,
    };
  }
  if (breakdown.some((r) => r.status === "needs_more_information")) {
    return {
      status: "needs_more_information",
      overallReason: "추가 확인이 필요한 조건이 있어요.",
      breakdown,
    };
  }
  return {
    status: "eligible",
    overallReason: "현재 입력 기준으로 지원 가능성이 높아요.",
    breakdown,
  };
}

export function statusToStatusText(status: DecisionStatus): string {
  switch (status) {
    case "eligible":
      return "현재 입력 기준으로 지원 가능성이 높아요";
    case "ineligible":
      return "현재 입력 기준으로 충족하지 않는 조건이 있어요";
    case "needs_more_information":
      return "추가 확인이 필요한 조건이 있어요";
    case "conflict":
      return "문서 간 안내가 서로 달라 확인이 필요해요";
    default:
      return status satisfies never;
  }
}
