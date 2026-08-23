import { SourceRegistry, validateEvidenceSourceIds } from "../../core/evidence";
import {
  chunkDocuments,
  createSearchIndex,
  searchVectorStore,
} from "../../core/search";
import { requestSolarAnswer } from "../../core/solar";
import type { CanonicalAgentResult } from "../../models/canonical";
import { answerQuestion, type QaControllerDependencies } from "./controller";
import { resolveCachedAnswer } from "./cached-answer";
import type { CachedFactGroup, QaAnswer } from "./types";

export async function runQaPipeline(input: {
  apiKey: string;
  result: CanonicalAgentResult;
  question: string;
  cachedFacts: readonly CachedFactGroup[];
  vectorStoreId?: string;
  onVectorStoreCreated?: (vectorStoreId: string) => void | Promise<void>;
  userProfile?: Readonly<Record<string, string | number | boolean | null>>;
  dependencies?: Partial<QaControllerDependencies>;
}): Promise<QaAnswer> {
  const chunks = await chunkDocuments({
    caseId: input.result.caseId,
    documents: input.result.documents,
    parseElements: input.result.parseElements,
    sources: input.result.sources,
  });
  const registry = new SourceRegistry().register(input.result.sources);
  const cached = resolveCachedAnswer(input.question, input.cachedFacts);
  if (cached) {
    const validation = validateEvidenceSourceIds({
      sourceIds: cached.evidenceSourceIds,
      currentCaseId: input.result.caseId,
      documentIds: input.result.documents.map((document) => document.id),
      registry,
      requireEvidence: true,
    });
    if (!validation.insufficient) {
      return {
        ...cached,
        evidenceSourceIds: validation.valid,
        rejectedSourceIds: validation.invalid,
      };
    }
  }

  let vectorStoreId = input.vectorStoreId;
  if (!vectorStoreId && !input.dependencies?.search) {
    const index = await createSearchIndex({
      apiKey: input.apiKey,
      caseId: input.result.caseId,
      chunks,
      documents: input.result.documents,
    });
    vectorStoreId = index.vectorStoreId;
    await input.onVectorStoreCreated?.(vectorStoreId);
  }
  if (!vectorStoreId && !input.dependencies?.search) {
    throw new Error("Search vector store를 준비하지 못했습니다");
  }

  return answerQuestion({
    question: input.question,
    caseId: input.result.caseId,
    documents: input.result.documents,
    chunks,
    extracts: input.result.extracts,
    cachedFacts: input.cachedFacts,
    registry,
    ...(input.userProfile ? { userProfile: input.userProfile } : {}),
    dependencies: {
      search:
        input.dependencies?.search ??
        ((question, topK) =>
          searchVectorStore({
            apiKey: input.apiKey,
            vectorStoreId: vectorStoreId!,
            query: question,
            topK,
          })),
      askSolar:
        input.dependencies?.askSolar ??
        ((solarInput) => requestSolarAnswer({ apiKey: input.apiKey, ...solarInput })),
    },
  });
}
