import type { ChunkRecord, DocumentRecord } from "../../models/canonical";
import type { SearchDocument } from "./types";

export function searchFileNameForChunk(chunk: ChunkRecord): string {
  return `up2stage-chunk-${chunk.contentHash}.md`;
}

export function buildSearchDocument(
  chunk: ChunkRecord,
  document: Pick<DocumentRecord, "fileName" | "role">
): SearchDocument {
  const section = chunk.sectionPath.length > 0 ? chunk.sectionPath.join(" > ") : "문서 본문";
  const role = chunk.role ?? document.role;
  const retrievalContext = [
    `문서: ${document.fileName}`,
    role ? `역할: ${role}` : undefined,
    `구역: ${section}`,
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");

  return {
    chunkId: chunk.id,
    fileName: searchFileNameForChunk(chunk),
    metadata: {
      caseId: chunk.caseId,
      documentId: chunk.documentId,
      ...(role ? { role } : {}),
      sectionPath: [...chunk.sectionPath],
    },
    retrievalContext,
    originalText: chunk.text,
    markdown: `# ${document.fileName}\n\n${retrievalContext}\n\n## 원문\n\n${chunk.text}`,
  };
}
