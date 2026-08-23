import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { uploadFile, createAgentJob, retrieveAgentJob } from "../../../../src/core/agent/api";
import type { AgentJob, UpstageFile } from "../../../../src/core/agent/types";

const apiKey = "up-test";

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
type FetchMock = Mock<FetchFn>;

function makeMockFetch(body: unknown, init: { status?: number; ok?: boolean } = {}): FetchMock {
  return vi.fn<FetchFn>(() =>
    Promise.resolve({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: "OK",
      json: () => Promise.resolve(body),
    } as Response)
  );
}

describe("Upstage Agent API adapter", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a file as multipart form data", async () => {
    const file: UpstageFile = {
      id: "file-123",
      object: "file",
      bytes: 1024,
      created_at: 1700000000,
      expires_at: null,
      filename: "notice.pdf",
      purpose: "user_data",
    };
    const fetchMock = makeMockFetch(file);
    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadFile(apiKey, "notice.pdf", new ArrayBuffer(8));
    expect(result.id).toBe("file-123");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit | undefined];
    expect(url).toContain("/v2/files");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${apiKey}`,
    });
  });

  it("creates an agent job with all output requested", async () => {
    const job: AgentJob = {
      id: "job-456",
      object: "response",
      created_at: 1700000000,
      status: "queued",
      model: "agt-test",
      output: [],
    };
    const fetchMock = makeMockFetch(job);
    vi.stubGlobal("fetch", fetchMock);

    const result = await createAgentJob({ apiKey, fileIds: ["file-123"] });
    expect(result.id).toBe("job-456");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit | undefined];
    expect(url).toContain("/v2/responses");
    const body = init ? (JSON.parse(init.body as string) as { include: string[]; input: unknown[] }) : null;
    expect(body?.include).toEqual(["all"]);
    expect(body?.input[0]).toMatchObject({
      role: "user",
      content: [{ type: "input_file", file_id: "file-123" }],
    });
  });

  it("retrieves a job with include[]=all", async () => {
    const job: AgentJob = {
      id: "job-456",
      object: "response",
      created_at: 1700000000,
      status: "completed",
      model: "agt-test",
      output: [
        {
          id: "o1",
          type: "message",
          status: "completed",
          role: "assistant",
          model: "step_1_parse",
          content: [{ type: "output_text", text: "{}", additional_values: undefined }],
        },
      ],
    };
    const fetchMock = makeMockFetch(job);
    vi.stubGlobal("fetch", fetchMock);

    const result = await retrieveAgentJob(apiKey, "job-456");
    expect(result.status).toBe("completed");
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit | undefined];
    expect(url).toContain("include%5B%5D=all");
  });

  it("throws a clear error on upload failure", async () => {
    const fetchMock = makeMockFetch(
      { error: { message: "bad request" } },
      { ok: false, status: 400 }
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(uploadFile(apiKey, "x.pdf", new ArrayBuffer(8))).rejects.toThrow("bad request");
  });
});
