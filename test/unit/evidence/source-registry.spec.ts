import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildSourceId,
  parseSourceId,
  buildSourcesFromParse,
  SourceRegistry,
  mapExtractToSources,
  resolveInstructCitations,
  validateEvidenceSourceIds,
  formatSourcePreview,
  collectSourceIdsFromText,
} from "../../../src/core/evidence";
import { navigateToSource } from "../../../src/features/source-navigation/navigate";
import { messaging } from "../../../src/core/messaging/protocol";

const CASE_ID = "case_01";
const DOCUMENT_ID = "doc_abc";

const parseHtml = `
<div data-page="1">
  <p data-category="paragraph" id="1">지원대상: 대한민국 국적자</p>
  <p data-category="list" id="2">① 서울 소재 대학교 재학생<br/>② 서울시민</p>
  <p data-category="paragraph" id="4">서울 지역 우선</p>
</div>
<div data-page="2">
  <p data-category="paragraph" id="3">신청기간: 2026. 8. 3. ~ 8. 10.</p>
</div>
`;

function makeSources() {
  return buildSourcesFromParse({
    caseId: CASE_ID,
    documentId: DOCUMENT_ID,
    html: parseHtml,
  });
}

describe("Source ID", () => {
  it("generates deterministic source IDs", () => {
    const id1 = buildSourceId(DOCUMENT_ID, 1, 1);
    const id2 = buildSourceId(DOCUMENT_ID, 1, 1);
    expect(id1).toBe(id2);
    expect(id1).toBe("src:doc_abc:p1:e1");
  });

  it("preserves string element IDs when not numeric", () => {
    const id = buildSourceId(DOCUMENT_ID, 2, "heading-a");
    expect(id).toBe("src:doc_abc:p2:eheading-a");
    expect(parseSourceId(id)?.elementId).toBe("heading-a");
  });

  it("rejects malformed source IDs", () => {
    expect(parseSourceId("not-a-source")).toBeUndefined();
    expect(parseSourceId("")).toBeUndefined();
  });
});

describe("Parse → Source Registry", () => {
  it("creates a stable SourceRecord from parse HTML", () => {
    const sources = makeSources();
    expect(sources).toHaveLength(4);
    expect(sources[0]!.sourceId).toBe("src:doc_abc:p1:e1");
    expect(sources[0]!.category).toBe("paragraph");
    expect(sources[0]!.text).toBe("지원대상: 대한민국 국적자");
    expect(sources[1]!.page).toBe(1);
    expect(sources[3]!.page).toBe(2);
  });

  it("deduplicates repeated registrations", () => {
    const registry = new SourceRegistry();
    const sources = makeSources();
    registry.register(sources);
    registry.register(sources);
    expect(registry.all()).toHaveLength(4);
  });
});

describe("Extract location mapping", () => {
  it("resolves an exact raw value to a single source", () => {
    const sources = makeSources();
    const mapping = mapExtractToSources(sources, {
      rawValue: "지원대상: 대한민국 국적자",
      page: 1,
      coordinates: [{ x: 0.1, y: 0.1 }],
      wordCoordinates: [[{ x: 0.1, y: 0.1 }]],
    });
    expect(mapping.unresolved).toBe(false);
    expect(mapping.sourceIds).toEqual(["src:doc_abc:p1:e1"]);
  });

  it("allows multiple candidates when a value appears in more than one source", () => {
    const sources = makeSources();
    const mapping = mapExtractToSources(sources, {
      rawValue: "서울",
      page: 1,
      coordinates: [{ x: 0.2, y: 0.2 }],
      wordCoordinates: [[{ x: 0.2, y: 0.2 }]],
    });
    expect(mapping.unresolved).toBe(false);
    expect(mapping.sourceIds).toContain("src:doc_abc:p1:e2");
    expect(mapping.sourceIds).toContain("src:doc_abc:p1:e4");
  });

  it("marks unknown raw values as unresolved", () => {
    const sources = makeSources();
    const mapping = mapExtractToSources(sources, {
      rawValue: "존재하지 않는 문장",
      page: 1,
      coordinates: [{ x: 0, y: 0 }],
      wordCoordinates: [[{ x: 0, y: 0 }]],
    });
    expect(mapping.unresolved).toBe(true);
    expect(mapping.sourceIds).toHaveLength(0);
  });
});

describe("Instruct citation mapping", () => {
  it("resolves extract source refs to source IDs", () => {
    const sources = makeSources();
    const titleMapping = mapExtractToSources(sources, {
      rawValue: "지원대상: 대한민국 국적자",
      page: 1,
      coordinates: [{ x: 0.1, y: 0.1 }],
      wordCoordinates: [[{ x: 0.1, y: 0.1 }]],
    });
    const extractMap = new Map([["title", titleMapping]]);
    const citations = [
      {
        index: 1,
        sourceType: "extract",
        sourceRef: "title",
        page: 1,
        coordinates: [{ x: 0.1, y: 0.1 }],
        wordCoordinates: [[{ x: 0.1, y: 0.1 }]],
      },
    ];

    const resolutions = resolveInstructCitations(citations, extractMap);
    expect(resolutions[0]!.sourceIds).toEqual(["src:doc_abc:p1:e1"]);
    expect(resolutions[0]!.unresolved).toBe(false);
  });

  it("marks unmapped citations as unresolved", () => {
    const citations = [
      {
        index: 2,
        sourceType: "extract",
        sourceRef: "benefits_or_outcomes[0]",
        page: 1,
        coordinates: [{ x: 0, y: 0 }],
        wordCoordinates: [[{ x: 0, y: 0 }]],
      },
    ];

    const resolutions = resolveInstructCitations(citations, new Map());
    expect(resolutions[0]!.unresolved).toBe(true);
    expect(resolutions[0]!.sourceIds).toHaveLength(0);
  });
});

describe("Guidance source contract", () => {
  it("collects source IDs from citation markers in text", () => {
    const resolutions = [
      { index: 1, sourceIds: ["src:doc_abc:p1:e1"], unresolved: false },
      { index: 2, sourceIds: ["src:doc_abc:p1:e2"], unresolved: false },
    ];
    const sourceIds = collectSourceIdsFromText(
      "장학금 개요【†1】과 신청 자격【†2】",
      resolutions
    );
    expect(sourceIds).toEqual(["src:doc_abc:p1:e1", "src:doc_abc:p1:e2"]);
  });
});

describe("Evidence validator", () => {
  let registry: SourceRegistry;

  beforeEach(() => {
    registry = new SourceRegistry();
    registry.register(makeSources());
  });

  it("accepts sources that belong to the current case and document", () => {
    const result = validateEvidenceSourceIds({
      sourceIds: ["src:doc_abc:p1:e1"],
      currentCaseId: CASE_ID,
      documentIds: [DOCUMENT_ID],
      registry,
    });
    expect(result.valid).toEqual(["src:doc_abc:p1:e1"]);
    expect(result.invalid).toHaveLength(0);
    expect(result.insufficient).toBe(false);
  });

  it("rejects sources from a different case", () => {
    registry.register([
      {
        sourceId: "src:doc_abc:p1:e99",
        caseId: "other_case",
        documentId: DOCUMENT_ID,
        page: 1,
        elementId: 99,
        category: "paragraph",
        text: "다른 케이스",
      },
    ]);
    const result = validateEvidenceSourceIds({
      sourceIds: ["src:doc_abc:p1:e99"],
      currentCaseId: CASE_ID,
      documentIds: [DOCUMENT_ID],
      registry,
    });
    expect(result.invalid).toEqual(["src:doc_abc:p1:e99"]);
    expect(result.insufficient).toBe(true);
  });

  it("rejects sources for unknown documents", () => {
    const result = validateEvidenceSourceIds({
      sourceIds: ["src:doc_abc:p1:e1"],
      currentCaseId: CASE_ID,
      documentIds: ["doc_xyz"],
      registry,
    });
    expect(result.invalid).toEqual(["src:doc_abc:p1:e1"]);
  });

  it("rejects a registered source outside the retrieved candidate set", () => {
    const result = validateEvidenceSourceIds({
      sourceIds: ["src:doc_abc:p1:e1"],
      currentCaseId: CASE_ID,
      documentIds: [DOCUMENT_ID],
      registry,
      allowedSourceIds: ["src:doc_abc:p1:e2"],
      requireEvidence: true,
    });
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(["src:doc_abc:p1:e1"]);
    expect(result.insufficient).toBe(true);
  });

  it("marks an empty evidence list insufficient when evidence is required", () => {
    const result = validateEvidenceSourceIds({
      sourceIds: [],
      currentCaseId: CASE_ID,
      documentIds: [DOCUMENT_ID],
      registry,
      requireEvidence: true,
    });
    expect(result.insufficient).toBe(true);
  });
});

describe("Source preview", () => {
  it("formats file, page and raw text", () => {
    const sources = makeSources();
    const preview = formatSourcePreview(sources[0]!, "공고문.pdf");
    expect(preview).toEqual({
      fileName: "공고문.pdf",
      page: 1,
      text: "지원대상: 대한민국 국적자",
    });
  });
});

describe("navigateToSource", () => {
  it("sends an openViewer message with case, document and source", async () => {
    const registry = new SourceRegistry();
    registry.register(makeSources());
    const spy = vi.spyOn(messaging, "openViewer").mockResolvedValue(undefined);

    await navigateToSource("src:doc_abc:p1:e1", registry);
    expect(spy).toHaveBeenCalledWith({
      caseId: CASE_ID,
      documentId: DOCUMENT_ID,
      sourceId: "src:doc_abc:p1:e1",
    });
  });
});
