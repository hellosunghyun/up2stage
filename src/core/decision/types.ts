import type { QuickQuestionRecord } from "../../models/canonical";

export type { QuestionInputType, QuestionOrigin } from "../../models/canonical";

export type UserAnswer = string | number | boolean | null;

export type QuickQuestion = QuickQuestionRecord;

export interface UserInput {
  [questionId: string]: UserAnswer;
}

export type DecisionStatus =
  | "eligible"
  | "ineligible"
  | "needs_more_information"
  | "conflict";

export interface RuleEvaluation {
  questionId: string;
  questionKey: string;
  label: string;
  input: UserAnswer;
  criterion: string;
  status: "pass" | "fail" | "needs_more_information" | "conflict";
  reason: string;
  sourceIds?: string[];
}

export interface DecisionResult {
  status: DecisionStatus;
  overallReason: string;
  breakdown: RuleEvaluation[];
}
