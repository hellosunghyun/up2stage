// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { normalizeSemanticDocument } from "../../../src/renderers/semantic";
import type { ParseElement } from "../../../src/models/canonical";

function parseElement(overrides: Partial<ParseElement>): ParseElement {
  return {
    id: "pe:1",
    caseId: "case-1",
    documentId: "doc-1",
    sourceId: "src:doc-1:p1:e1",
    elementId: "1",
    category: "paragraph",
    type: "paragraph",
    page: 1,
    ...overrides
  };
}

describe("Semantic Normalizer", () => {
  it("maps headings and keeps the existing Source ID as the semantic node ID", () => {
    const [node] = normalizeSemanticDocument([
      parseElement({
        sourceId: "src:doc-1:p1:e9",
        category: "heading3",
        type: "heading",
        html: '<h3 onclick="alert(1)">지원 자격</h3>'
      })
    ]);

    expect(node).toMatchObject({
      id: "src:doc-1:p1:e9",
      sourceId: "src:doc-1:p1:e9",
      type: "heading",
      level: 3,
      text: "지원 자격"
    });
  });

  it("normalizes native and line-break lists without injecting raw Parse HTML", () => {
    const nodes = normalizeSemanticDocument([
      parseElement({
        category: "ordered_list",
        type: "list",
        html: "<ol><li>첫 번째 단계</li><li>두 번째 단계</li></ol>"
      }),
      parseElement({
        sourceId: "src:doc-1:p1:e2",
        elementId: "2",
        category: "list",
        type: "list",
        html: '<p data-category="list">- 제출서류 확인<br>- 최종 제출</p>'
      })
    ]);

    expect(nodes[0]).toMatchObject({
      type: "ordered-list",
      listItems: [{ text: "첫 번째 단계" }, { text: "두 번째 단계" }]
    });
    expect(nodes[1]).toMatchObject({
      type: "unordered-list",
      listItems: [{ text: "제출서류 확인" }, { text: "최종 제출" }]
    });
  });

  it("preserves native table sections, header scope and cell spans", () => {
    const [node] = normalizeSemanticDocument([
      parseElement({
        category: "table",
        type: "table",
        html: [
          "<table>",
          "<caption>지원 조건</caption>",
          '<thead><tr><th scope="col">구분</th><th scope="col">조건</th></tr></thead>',
          '<tbody><tr><th scope="row">성적</th><td colspan="2">90점 이상</td></tr></tbody>',
          "</table>"
        ].join("")
      })
    ]);

    expect(node?.tableCaption).toBe("지원 조건");
    expect(node?.tableRows).toEqual([
      expect.objectContaining({
        section: "head",
        cells: [
          expect.objectContaining({ header: true, scope: "col", text: "구분" }),
          expect.objectContaining({ header: true, scope: "col", text: "조건" })
        ]
      }),
      expect.objectContaining({
        section: "body",
        cells: [
          expect.objectContaining({ header: true, scope: "row", text: "성적" }),
          expect.objectContaining({ header: false, colSpan: 2, text: "90점 이상" })
        ]
      })
    ]);
  });

  it("keeps original figure captions distinct and nests them under the figure", () => {
    const [figure] = normalizeSemanticDocument([
      parseElement({ category: "figure", type: "figure", text: "선발 절차 도식" }),
      parseElement({
        sourceId: "src:doc-1:p1:e2",
        elementId: "2",
        category: "caption",
        type: "caption",
        text: "그림 1. 선발 절차"
      })
    ]);

    expect(figure).toMatchObject({
      type: "figure",
      text: "문서에 포함된 그림",
      children: [
        {
          id: "src:doc-1:p1:e2",
          sourceId: "src:doc-1:p1:e2",
          type: "caption",
          text: "그림 1. 선발 절차"
        }
      ]
    });
  });

  it("does not promote an AI-generated figure description to an original caption", () => {
    const [figure] = normalizeSemanticDocument([
      parseElement({
        category: "figure",
        type: "figure",
        text: "AI가 생성한 이미지 설명",
        html: '<figure><img alt="AI가 생성한 이미지 설명"></figure>'
      })
    ]);

    expect(figure).toMatchObject({ type: "figure", text: "문서에 포함된 그림" });
    expect(figure?.children).toBeUndefined();
  });
});
