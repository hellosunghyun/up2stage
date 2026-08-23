import type { SolarAnswerInput } from "./types";

export const SOLAR_SYSTEM_PROMPT = `당신은 Up to Stage의 문서 질의응답 엔진입니다.
제공된 relevant chunks, candidate source records, extract facts만 사용하세요.
evidenceSourceIds에는 candidate source records에 실제로 있는 Source ID만 그대로 선택하세요.
검색용 제목, metadata, summary는 근거가 아닙니다.
근거가 부족하면 단정하지 말고 answer에 "insufficient evidence"를 포함하고 missingInformation을 작성하세요.`;

export function buildSolarUserPrompt(input: Omit<SolarAnswerInput, "apiKey">): string {
  const chunks = input.relevantChunks.map((chunk) => ({
    chunkId: chunk.id,
    sectionPath: chunk.sectionPath,
    text: chunk.text,
    sourceIds: chunk.sourceIds,
  }));
  const sources = input.candidateSources.map((source) => ({
    sourceId: source.sourceId,
    documentId: source.documentId,
    page: source.page,
    text: source.text,
  }));

  return JSON.stringify({
    question: input.question,
    relevantChunks: chunks,
    candidateSourceRecords: sources,
    extractFacts: input.extractFacts ?? [],
    ...(input.userProfile ? { userProfile: input.userProfile } : {}),
  });
}
