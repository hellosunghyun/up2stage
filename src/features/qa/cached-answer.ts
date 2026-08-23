import type { CachedFactGroup, CachedFactKind, QaAnswer } from "./types";

const KEYWORDS: Record<CachedFactKind, RegExp> = {
  schedule: /(마감|일정|기간|언제|날짜)/,
  submissions: /(제출|서류|준비|첨부)/,
  cautions: /(주의|유의|경고|실수|탈락)/,
  actions: /(다음|해야|절차|방법|순서)/,
};

const LABELS: Record<CachedFactKind, string> = {
  schedule: "확인된 주요 일정",
  submissions: "확인된 제출물",
  cautions: "확인된 주의사항",
  actions: "확인된 다음 행동",
};

export function resolveCachedAnswer(
  question: string,
  facts: readonly CachedFactGroup[]
): QaAnswer | undefined {
  const fact = facts.find(
    (item) => item.values.length > 0 && KEYWORDS[item.kind].test(question)
  );
  if (!fact) return undefined;
  return {
    status: "answered",
    origin: "cached",
    answer: `${LABELS[fact.kind]}은 다음과 같아요.\n${fact.values.map((value) => `• ${value}`).join("\n")}`,
    evidenceSourceIds: [...new Set(fact.sourceIds)],
    rejectedSourceIds: [],
    missingInformation: [],
    nextActions: [],
  };
}
