import { AGENT_ID, BASE_URL } from "./config";
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

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  hwp: "application/x-hwp",
  hwpx: "application/x-hwp",
  msg: "application/vnd.ms-outlook",
  eml: "message/rfc822",
  mht: "message/rfc822",
  html: "text/html",
  md: "text/markdown",
  txt: "text/plain",
};

function normalizeMimeType(fileName: string, mimeType?: string): string {
  const cleaned = mimeType?.split(";")[0]?.trim().toLowerCase();
  if (cleaned && cleaned !== "application/octet-stream") {
    return mimeType!.split(";")[0]!.trim();
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext ? (MIME_TYPES[ext] ?? "application/octet-stream") : "application/octet-stream";
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
  bytes: ArrayBuffer,
  mimeType?: string
): Promise<UpstageFile> {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: normalizeMimeType(fileName, mimeType) }), fileName);
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
        model: AGENT_ID,
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
