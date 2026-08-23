import type { ChunkRecord, SourceRecord } from "../../models/canonical";

export type SolarDecision =
  | "eligible"
  | "ineligible"
  | "needs_more_information"
  | "conflict";

export interface SolarAnswer {
  answer: string;
  decision?: SolarDecision;
  evidenceSourceIds: string[];
  missingInformation: string[];
  nextActions: string[];
}

export interface ExtractFact {
  field: string;
  value: string;
}

export interface SolarAnswerInput {
  apiKey: string;
  question: string;
  relevantChunks: readonly ChunkRecord[];
  candidateSources: readonly SourceRecord[];
  extractFacts?: readonly ExtractFact[];
  userProfile?: Readonly<Record<string, string | number | boolean | null>>;
}
