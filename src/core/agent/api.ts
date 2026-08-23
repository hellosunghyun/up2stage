import { BASE_URL } from "./config";
import { agentJobSchema, upstageFileSchema } from "./types";
import type { AgentJob, UpstageFile } from "./types";

function withAuth(apiKey: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  };
}

async function unwrap<T>(res: Response, parser: (data: unknown) => T): Promise<T> {
  if (!res.ok) {
    let message = `Upstage API ${res.status}`;
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (err?.error?.message) {
        message = err.error.message;
      }
    } catch {
      message = `${message}: ${res.statusText}`;
    }
    throw new Error(message);
  }
  const data: unknown = await res.json();
  return parser(data);
}

export async function uploadFile(
  apiKey: string,
  fileName: string,
  bytes: ArrayBuffer
): Promise<UpstageFile> {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "application/octet-stream" }), fileName);
  form.append("purpose", "user_data");

  const res = await fetch(`${BASE_URL}/files`, withAuth(apiKey, { method: "POST", body: form }));
  return unwrap(res, (data) => upstageFileSchema.parse(data));
}

export interface CreateAgentJobInput {
  apiKey: string;
  fileIds: string[];
}

export async function createAgentJob(input: CreateAgentJobInput): Promise<AgentJob> {
  const res = await fetch(
    `${BASE_URL}/responses`,
    withAuth(input.apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        include: ["all"],
        input: [
          {
            role: "user",
            content: input.fileIds.map((file_id) => ({ type: "input_file", file_id })),
          },
        ],
      }),
    })
  );
  return unwrap(res, (data) => agentJobSchema.parse(data));
}

export async function retrieveAgentJob(apiKey: string, jobId: string): Promise<AgentJob> {
  const url = new URL(`${BASE_URL}/responses/${jobId}`);
  url.searchParams.append("include[]", "all");

  const res = await fetch(url.toString(), withAuth(apiKey, { method: "GET" }));
  return unwrap(res, (data) => agentJobSchema.parse(data));
}
