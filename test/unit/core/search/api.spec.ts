import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  addFileToVectorStore,
  createVectorStore,
  retrieveVectorStoreFile,
  searchVectorStore,
} from "../../../../src/core/search";

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
type FetchMock = Mock<FetchFn>;

function mockFetch(body: unknown): FetchMock {
  return vi.fn<FetchFn>(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(body),
    } as Response)
  );
}

describe("Upstage File Search API adapter", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("uses the documented vector store create contract", async () => {
    const fetchMock = mockFetch({ id: "vs-1", status: "completed", extra: true });
    vi.stubGlobal("fetch", fetchMock);
    await expect(createVectorStore("key", "up2stage-case")).resolves.toMatchObject({ id: "vs-1" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v2/vector_stores");
    expect(JSON.parse(init.body as string)).toEqual({ name: "up2stage-case" });
  });

  it("adds and retrieves a file with the documented fields", async () => {
    const fetchMock = mockFetch({ id: "file-1", status: "in_progress", last_error: null });
    vi.stubGlobal("fetch", fetchMock);
    await addFileToVectorStore({ apiKey: "key", vectorStoreId: "vs-1", fileId: "file-1" });
    let [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/vector_stores/vs-1/files");
    expect(JSON.parse(init.body as string)).toEqual({ file_id: "file-1" });

    await retrieveVectorStoreFile({ apiKey: "key", vectorStoreId: "vs-1", fileId: "file-1" });
    [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toContain("/vector_stores/vs-1/files/file-1");
    expect(init.method).toBe("GET");
  });

  it("searches with the spec default topK and normalizes text blocks", async () => {
    const fetchMock = mockFetch({
      data: [
        {
          filename: "up2stage-chunk-abc.md",
          score: 0.91,
          content: [
            { type: "text", text: "첫 문장" },
            { type: "text", text: "둘째 문장" },
          ],
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);
    const hits = await searchVectorStore({ apiKey: "key", vectorStoreId: "vs-1", query: "마감" });
    expect(hits[0]).toMatchObject({ score: 0.91, text: "첫 문장둘째 문장" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ query: "마감", max_num_results: 5 });
  });

  it("does not expand retrieval beyond the product maximum of 10", async () => {
    const fetchMock = mockFetch({ data: [] });
    vi.stubGlobal("fetch", fetchMock);
    await searchVectorStore({ apiKey: "key", vectorStoreId: "vs-1", query: "질문", topK: 99 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { max_num_results: number };
    expect(body.max_num_results).toBe(10);
  });
});
