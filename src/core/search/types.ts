import type {
  ChunkRecord,
  DocumentRecord,
  ParseElement,
  SourceRecord,
} from "../../models/canonical";

export interface ChunkingLimits {
  targetTokens: number;
  maxTokens: number;
  minTokens: number;
  overlapTokens: number;
}

export interface SectionChunkerInput {
  caseId: string;
  document: Pick<DocumentRecord, "id" | "role" | "fileName">;
  parseElements: readonly ParseElement[];
  sources: readonly SourceRecord[];
  limits?: Partial<ChunkingLimits>;
}

export interface SearchDocument {
  chunkId: string;
  fileName: string;
  metadata: {
    caseId: string;
    documentId: string;
    role?: DocumentRecord["role"];
    sectionPath: string[];
  };
  retrievalContext: string;
  originalText: string;
  markdown: string;
}

export interface SearchHit {
  filename: string;
  score: number;
  text: string;
}

export interface ResolvedSearchHit {
  hit: SearchHit;
  chunk: ChunkRecord;
}

export interface CandidateSourceResolution {
  hits: ResolvedSearchHit[];
  sources: SourceRecord[];
  unresolvedFilenames: string[];
}
