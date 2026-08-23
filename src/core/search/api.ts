import { BASE_URL } from "../agent/config";
import type { SearchHit } from "./types";
import {
  vectorSearchResponseSchema,
  vectorStoreFileSchema,
  vectorStoreSchema,
  type VectorStore,
  type VectorStoreFile,
} from "./schemas";

function withAuth(apiKey: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  };
}

async function unwrap<T>(response: Response, parse: (data: unknown) => T): Promise<T> {
  if (!response.ok) {
    let message = `Upstage Search API ${response.status}`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      message = `${message}: ${response.statusText}`;
    }
    throw new Error(message);
  }
  return parse(await response.json());
}

export async function createVectorStore(
  apiKey: string,
  name: string
): Promise<VectorStore> {
  const response = await fetch(
    `${BASE_URL}/vector_stores`,
    withAuth(apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
  return unwrap(response, (data) => vectorStoreSchema.parse(data));
}

export async function addFileToVectorStore(input: {
  apiKey: string;
  vectorStoreId: string;
  fileId: string;
}): Promise<VectorStoreFile> {
  const response = await fetch(
    `${BASE_URL}/vector_stores/${encodeURIComponent(input.vectorStoreId)}/files`,
    withAuth(input.apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: input.fileId }),
    })
  );
  return unwrap(response, (data) => vectorStoreFileSchema.parse(data));
}

export async function retrieveVectorStoreFile(input: {
  apiKey: string;
  vectorStoreId: string;
  fileId: string;
}): Promise<VectorStoreFile> {
  const response = await fetch(
    `${BASE_URL}/vector_stores/${encodeURIComponent(input.vectorStoreId)}/files/${encodeURIComponent(input.fileId)}`,
    withAuth(input.apiKey, { method: "GET" })
  );
  return unwrap(response, (data) => vectorStoreFileSchema.parse(data));
}

export async function searchVectorStore(input: {
  apiKey: string;
  vectorStoreId: string;
  query: string;
  topK?: number;
}): Promise<SearchHit[]> {
  const maxNumResults = Math.min(10, Math.max(1, input.topK ?? 5));
  const response = await fetch(
    `${BASE_URL}/vector_stores/${encodeURIComponent(input.vectorStoreId)}/search`,
    withAuth(input.apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input.query, max_num_results: maxNumResults }),
    })
  );
  const parsed = await unwrap(response, (data) => vectorSearchResponseSchema.parse(data));
  return parsed.data.map((item) => ({
    filename: item.filename,
    score: item.score,
    text: item.content.map((block) => block.text).join(""),
  }));
}
