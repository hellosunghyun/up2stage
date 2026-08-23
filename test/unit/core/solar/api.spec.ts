import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { requestSolarAnswer } from "../../../../src/core/solar";
import type { ChunkRecord, SourceRecord } from "../../../../src/models/canonical";

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
type FetchMock = Mock<FetchFn>;

const chunk: ChunkRecord = {
  id: "chunk:doc:1",
  caseId: "case-1",
  documentId: "doc-1",
  sectionPath: ["지원 자격"],
  text: "원격대학 재학생은 지원 대상에서 제외됩니다.",
  sourceIds: ["src:doc-1:p2:e4"],
  pages: [2],
  contentHash: "hash",
};
const source: SourceRecord = {
  sourceId: "src:doc-1:p2:e4",
  caseId: "case-1",
  documentId: "doc-1",
  page: 2,
  elementId: 4,
  category: "paragraph",
  text: chunk.text,
};

function response(body: unknown): FetchMock {
  return vi.fn<FetchFn>(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(body),
    } as Response)
  );
}

describe("Solar structured output adapter", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("requests and validates the documented structured output", async () => {
    const fetchMock = response({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: JSON.stringify({
              answer: "원격대학 재학생은 지원할 수 없습니다.",
              decision: "ineligible",
              evidenceSourceIds: [source.sourceId],
              missingInformation: [],
              nextActions: ["재학 학교 유형을 확인하세요."],
            }),
          },
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const answer = await requestSolarAnswer({
      apiKey: "key",
      question: "원격대학도 지원 가능한가요?",
      relevantChunks: [chunk],
      candidateSources: [source],
      extractFacts: [{ field: "requirements", value: "원격대학 제외" }],
    });
    expect(answer).toMatchObject({ decision: "ineligible", evidenceSourceIds: [source.sourceId] });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v2/chat/completions");
    const body = JSON.parse(init.body as string) as {
      model: string;
      reasoning_effort: string;
      messages: Array<{ content: string }>;
      response_format: { type: string; json_schema: { strict: boolean } };
    };
    expect(body.model).toBe("solar-pro4");
    expect(body.reasoning_effort).toBe("minimal");
    expect(body.response_format).toMatchObject({
      type: "json_schema",
      json_schema: { strict: true },
    });
    expect(body.messages[1]?.content).toContain(source.sourceId);
    expect(body.messages[1]?.content).not.toContain("전체 Parse document");
  });

  it("rejects truncated structured output", async () => {
    vi.stubGlobal(
      "fetch",
      response({ choices: [{ finish_reason: "length", message: { content: "{" } }] })
    );
    await expect(
      requestSolarAnswer({
        apiKey: "key",
        question: "질문",
        relevantChunks: [chunk],
        candidateSources: [source],
      })
    ).rejects.toThrow("완결되지 않았습니다");
  });
});
