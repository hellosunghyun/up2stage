import { uploadFile } from "../agent/api";
import type { ChunkRecord, DocumentRecord } from "../../models/canonical";
import { addFileToVectorStore, createVectorStore, retrieveVectorStoreFile } from "./api";
import { buildSearchDocument } from "./representation";

const MAX_VECTOR_STORE_FILES = 500;

export interface SearchIndexResult {
  vectorStoreId: string;
  indexedChunkIds: string[];
}

export interface SearchIndexOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function waitForIndexing(input: {
  apiKey: string;
  vectorStoreId: string;
  fileId: string;
  pollIntervalMs: number;
  timeoutMs: number;
}): Promise<void> {
  const startedAt = Date.now();
  for (;;) {
    const file = await retrieveVectorStoreFile(input);
    if (file.status === "completed") return;
    if (file.status === "failed" || file.status === "cancelled") {
      throw new Error(`Search indexing failed for ${input.fileId}`);
    }
    if (Date.now() - startedAt >= input.timeoutMs) {
      throw new Error(`Search indexing timed out for ${input.fileId}`);
    }
    await wait(input.pollIntervalMs);
  }
}

export async function createSearchIndex(input: {
  apiKey: string;
  caseId: string;
  chunks: readonly ChunkRecord[];
  documents: readonly Pick<DocumentRecord, "id" | "fileName" | "role">[];
  options?: SearchIndexOptions;
}): Promise<SearchIndexResult> {
  if (input.chunks.length === 0) {
    throw new Error("Search index에 추가할 chunk가 없습니다");
  }
  if (input.chunks.length > MAX_VECTOR_STORE_FILES) {
    throw new Error(`Search index는 최대 ${MAX_VECTOR_STORE_FILES}개 chunk를 지원합니다`);
  }

  const store = await createVectorStore(input.apiKey, `up2stage-${input.caseId}`);
  const pollIntervalMs = input.options?.pollIntervalMs ?? 2_000;
  const timeoutMs = input.options?.timeoutMs ?? 120_000;
  const indexedChunkIds: string[] = [];

  for (const chunk of input.chunks) {
    const document = input.documents.find((item) => item.id === chunk.documentId);
    if (!document) throw new Error(`Chunk 문서를 찾지 못했습니다: ${chunk.documentId}`);
    const searchDocument = buildSearchDocument(chunk, document);
    const encoded = new TextEncoder().encode(searchDocument.markdown);
    const bytes = encoded.buffer.slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength
    ) as ArrayBuffer;
    const uploaded = await uploadFile(
      input.apiKey,
      searchDocument.fileName,
      bytes,
      "text/markdown"
    );
    const vectorFile = await addFileToVectorStore({
      apiKey: input.apiKey,
      vectorStoreId: store.id,
      fileId: uploaded.id,
    });
    if (vectorFile.status !== "completed") {
      await waitForIndexing({
        apiKey: input.apiKey,
        vectorStoreId: store.id,
        fileId: vectorFile.id,
        pollIntervalMs,
        timeoutMs,
      });
    }
    indexedChunkIds.push(chunk.id);
  }

  return { vectorStoreId: store.id, indexedChunkIds };
}
