import type { ChunkRecord, SourceRecord } from "../../models/canonical";
import type { SourceRegistry } from "../evidence";
import { searchFileNameForChunk } from "./representation";
import type {
  CandidateSourceResolution,
  ResolvedSearchHit,
  SearchHit,
} from "./types";

export function resolveCandidateSources(input: {
  hits: readonly SearchHit[];
  chunks: readonly ChunkRecord[];
  registry: SourceRegistry;
  caseId: string;
}): CandidateSourceResolution {
  const chunkByFileName = new Map(
    input.chunks.map((chunk) => [searchFileNameForChunk(chunk), chunk])
  );
  const hits: ResolvedSearchHit[] = [];
  const sources = new Map<string, SourceRecord>();
  const unresolvedFilenames: string[] = [];

  for (const hit of input.hits) {
    const chunk = chunkByFileName.get(hit.filename);
    if (!chunk || chunk.caseId !== input.caseId) {
      unresolvedFilenames.push(hit.filename);
      continue;
    }
    hits.push({ hit, chunk });
    for (const sourceId of chunk.sourceIds) {
      const source = input.registry.get(sourceId);
      if (source && source.caseId === input.caseId) {
        sources.set(source.sourceId, source);
      }
    }
  }

  return { hits, sources: [...sources.values()], unresolvedFilenames };
}
