import type { SolarDecision } from "../../core/solar";

export type CachedFactKind = "schedule" | "submissions" | "cautions" | "actions";

export interface CachedFactGroup {
  kind: CachedFactKind;
  values: string[];
  sourceIds: string[];
}

export interface QaAnswer {
  status: "answered" | "insufficient_evidence";
  origin: "cached" | "solar";
  answer: string;
  decision?: SolarDecision;
  evidenceSourceIds: string[];
  rejectedSourceIds: string[];
  missingInformation: string[];
  nextActions: string[];
}
