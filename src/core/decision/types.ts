export type QuestionInputType =
  | "text"
  | "number"
  | "select"
  | "boolean"
  | "date"
  | "organization_select";

export type UserAnswer = string | number | boolean | null;

export type QuestionOrigin = "primary_notice" | "requirements_checklist";

export interface QuickQuestion {
  id: string;
  key: string;
  label: string;
  inputType: QuestionInputType;
  required: boolean;
  options?: string[];
  ruleText?: string;
  sourceIds?: string[];
  confidence?: number;
  origin: QuestionOrigin;
}

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
