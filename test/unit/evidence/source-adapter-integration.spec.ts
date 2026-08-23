import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildSourcesFromParse,
  mapExtractToSources,
  buildExtractLocationMap,
  resolveInstructCitations,
  SourceRegistry,
} from "../../../src/core/evidence";
import {
  navigateToSource,
  setNavigationRegistry,
} from "../../../src/features/source-navigation/navigate";
import { messaging } from "../../../src/core/messaging/protocol";

const CASE_ID = "case_int";
const DOCUMENT_ID = "doc_real";

const realisticHtml = `
<header id="0" style="font-size:18px">공고 제2026-23호</header>
<p data-category="paragraph" id="1">2026년 하반기 서울인재대학장학금</p>
<footer id="13" style="font-size:14px">- 1 -</footer>
<header id="14" style="font-size:22px">서울미래인재재단</header>
<p data-category="paragraph" id="2">신청기간: 2026. 8. 3. ~ 8. 10.</p>
<footer id="15" style="font-size:14px">- 2 -</footer>
<p data-category="paragraph">자기소개서 안내</p>
`;

function makeRealisticSources() {
  return buildSourcesFromParse({
    caseId: CASE_ID,
    documentId: DOCUMENT_ID,
    html: realisticHtml,
  });
}

describe("Realistic parse page estimation", () => {
  it("infers page from footer markers", () => {
    const sources = makeRealisticSources();
    const p1 = sources.find((s) => s.elementId === 1);
    const p2 = sources.find((s) => s.elementId === 2);
    const fallback = sources.find((s) => s.elementId === "3_1");

    expect(p1?.page).toBe(1);
    expect(p2?.page).toBe(2);
    expect(fallback?.page).toBe(3);
  });
});

describe("Extract normalization", () => {
  it("matches even if Extract raw value has extra whitespace", () => {
    const sources = makeRealisticSources();
    const mapping = mapExtractToSources(sources, {
      rawValue: "2026년  하반기  서울인재대학장학금",
      page: 1,
      coordinates: [{ x: 0, y: 0 }],
      wordCoordinates: [[{ x: 0, y: 0 }]],
    });
    expect(mapping.unresolved).toBe(false);
    expect(mapping.sourceIds).toEqual([`src:${DOCUMENT_ID}:p1:e1`]);
  });
});

describe("Extract output adapter", () => {
  it("builds a source ref map from realistic Extract fields", () => {
    const sources = makeRealisticSources();
    const extractFields = {
      previous_step_name: "step_1",
      title: {
        _value: "2026년 하반기 서울인재대학장학금",
        page: 1,
        coordinates: [{ x: 0.1, y: 0.1 }],
        word_coordinates: [[{ x: 0.1, y: 0.1 }]],
        confidence_score: 0.97,
      },
      key_dates: [
        {
          _value: "신청기간: 2026. 8. 3. ~ 8. 10.",
          page: 2,
          coordinates: [{ x: 0.2, y: 0.2 }],
          word_coordinates: [[{ x: 0.2, y: 0.2 }]],
          confidence_score: 0.95,
        },
      ],
      intro: {
        _value: "자기소개서 안내",
        page: 3,
        coordinates: [{ x: 0.3, y: 0.3 }],
        word_coordinates: [[{ x: 0.3, y: 0.3 }]],
        confidence_score: 0.91,
      },
    };

    const map = buildExtractLocationMap(sources, extractFields);

    expect(map.get("title")?.unresolved).toBe(false);
    expect(map.get("title")?.sourceIds).toEqual([`src:${DOCUMENT_ID}:p1:e1`]);
    expect(map.get("key_dates[0]")?.sourceIds).toEqual([
      `src:${DOCUMENT_ID}:p2:e2`,
    ]);
    expect(map.get("intro")?.sourceIds).toEqual([`src:${DOCUMENT_ID}:p3:e3_1`]);
    expect(map.has("previous_step_name")).toBe(false);
  });

  it("resolves Instruct citations against the Extract map", () => {
    const sources = makeRealisticSources();
    const extractFields = {
      title: {
        _value: "2026년 하반기 서울인재대학장학금",
        page: 1,
        coordinates: [{ x: 0.1, y: 0.1 }],
        word_coordinates: [[{ x: 0.1, y: 0.1 }]],
        confidence_score: 0.97,
      },
    };
    const map = buildExtractLocationMap(sources, extractFields);

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

    const resolutions = resolveInstructCitations(citations, map);
    expect(resolutions[0]!.sourceIds).toEqual([`src:${DOCUMENT_ID}:p1:e1`]);
  });
});

describe("navigateToSource with active registry", () => {
  beforeEach(() => {
    setNavigationRegistry(new SourceRegistry());
  });

  it("uses the active navigation registry when none is passed", async () => {
    const sources = makeRealisticSources();
    const registry = new SourceRegistry();
    registry.register(sources);
    setNavigationRegistry(registry);

    const spy = vi.spyOn(messaging, "openViewer").mockResolvedValue(undefined);
    await navigateToSource(`src:${DOCUMENT_ID}:p1:e1`);

    expect(spy).toHaveBeenCalledWith({
      caseId: CASE_ID,
      documentId: DOCUMENT_ID,
      sourceId: `src:${DOCUMENT_ID}:p1:e1`,
    });
  });
});
