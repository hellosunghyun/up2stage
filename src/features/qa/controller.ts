import { validateEvidenceSourceIds, type SourceRegistry } from "../../core/evidence";
import { resolveCandidateSources, type SearchHit } from "../../core/search";
import type { SolarAnswer, SolarAnswerInput } from "../../core/solar";
import type { ChunkRecord, DocumentRecord, ExtractRecord } from "../../models/canonical";
import { resolveCachedAnswer } from "./cached-answer";
import { selectRelevantExtractFacts } from "./extract-facts";
import type { CachedFactGroup, QaAnswer } from "./types";

export interface QaControllerDependencies {
  search(question: string, topK: number): Promise<SearchHit[]>;
  askSolar(input: Omit<SolarAnswerInput, "apiKey">): Promise<SolarAnswer>;
}

export async function answerQuestion(input: {
  question: string;
  caseId: string;
  documents: readonly Pick<DocumentRecord, "id">[];
  chunks: readonly ChunkRecord[];
  extracts: readonly ExtractRecord[];
  cachedFacts: readonly CachedFactGroup[];
  registry: SourceRegistry;
  userProfile?: Readonly<Record<string, string | number | boolean | null>>;
  dependencies: QaControllerDependencies;
}): Promise<QaAnswer> {
  const cached = resolveCachedAnswer(input.question, input.cachedFacts);
  if (cached) {
    const validation = validateEvidenceSourceIds({
      sourceIds: cached.evidenceSourceIds,
      currentCaseId: input.caseId,
      documentIds: input.documents.map((document) => document.id),
      registry: input.registry,
      requireEvidence: true,
    });
    if (!validation.insufficient) {
      return { ...cached, evidenceSourceIds: validation.valid, rejectedSourceIds: validation.invalid };
    }
  }

  const searchHits = await input.dependencies.search(input.question, 5);
  const candidates = resolveCandidateSources({
    hits: searchHits,
    chunks: input.chunks,
    registry: input.registry,
    caseId: input.caseId,
  });
  if (candidates.sources.length === 0) {
    return insufficientAnswer(["질문과 연결되는 원문 근거"]);
  }

  const solar = await input.dependencies.askSolar({
    question: input.question,
    relevantChunks: candidates.hits.map((item) => item.chunk),
    candidateSources: candidates.sources,
    extractFacts: selectRelevantExtractFacts(input.question, input.extracts),
    ...(input.userProfile ? { userProfile: input.userProfile } : {}),
  });
  const allowedSourceIds = candidates.sources.map((source) => source.sourceId);
  const validation = validateEvidenceSourceIds({
    sourceIds: solar.evidenceSourceIds,
    currentCaseId: input.caseId,
    documentIds: input.documents.map((document) => document.id),
    registry: input.registry,
    allowedSourceIds,
    requireEvidence: true,
  });
  if (validation.insufficient) {
    return {
      ...insufficientAnswer(
        solar.missingInformation.length > 0
          ? solar.missingInformation
          : ["답변을 뒷받침하는 원문 근거"]
      ),
      rejectedSourceIds: validation.invalid,
    };
  }

  return {
    status: "answered",
    origin: "solar",
    answer: solar.answer,
    ...(solar.decision ? { decision: solar.decision } : {}),
    evidenceSourceIds: validation.valid,
    rejectedSourceIds: validation.invalid,
    missingInformation: solar.missingInformation,
    nextActions: solar.nextActions,
  };
}

function insufficientAnswer(missingInformation: string[]): QaAnswer {
  return {
    status: "insufficient_evidence",
    origin: "solar",
    answer: "insufficient evidence — 현재 확인된 원문 근거만으로는 답하기 어려워요.",
    evidenceSourceIds: [],
    rejectedSourceIds: [],
    missingInformation,
    nextActions: ["원문 문서에서 추가 정보를 확인해 주세요."],
  };
}
