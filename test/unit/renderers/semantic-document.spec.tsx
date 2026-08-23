// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SemanticDocument } from "../../../src/renderers/semantic";
import type { SemanticRenderNode } from "../../../src/renderers/semantic";

const nodes: SemanticRenderNode[] = [
  {
    id: "src:doc-1:p1:e1",
    sourceId: "src:doc-1:p1:e1",
    type: "heading",
    level: 2,
    text: "지원 자격"
  },
  {
    id: "src:doc-1:p1:e2",
    sourceId: "src:doc-1:p1:e2",
    type: "unordered-list",
    listItems: [
      { id: "item-1", text: "서울 소재 대학" },
      { id: "item-2", text: "백분위 90점 이상" }
    ]
  },
  {
    id: "src:doc-1:p1:e3",
    sourceId: "src:doc-1:p1:e3",
    type: "table",
    tableRows: [
      {
        id: "row-1",
        section: "head",
        cells: [{ id: "cell-1", text: "구분", header: true, scope: "col" }]
      },
      {
        id: "row-2",
        section: "body",
        cells: [{ id: "cell-2", text: "성적", header: false }]
      }
    ]
  }
];

afterEach(cleanup);

describe("SemanticDocument", () => {
  it("renders native heading, list and table semantics", () => {
    render(<SemanticDocument nodes={nodes} documentLabel="공고문.pdf" />);

    expect(screen.getByRole("heading", { level: 2, name: "지원 자격" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "구분" })).toHaveAttribute("scope", "col");
  });

  it("syncs focus and supports Enter and Escape without custom heading shortcuts", () => {
    const onFocus = vi.fn();
    const onActivate = vi.fn();
    const onEscape = vi.fn();
    render(
      <SemanticDocument
        nodes={nodes}
        documentLabel="공고문.pdf"
        onNodeFocus={onFocus}
        onNodeActivate={onActivate}
        onEscape={onEscape}
      />
    );

    const headingBlock = screen.getByRole("heading", { name: "지원 자격" }).parentElement;
    expect(headingBlock).not.toBeNull();
    headingBlock?.focus();
    expect(onFocus).toHaveBeenCalledWith("src:doc-1:p1:e1");

    if (headingBlock) {
      fireEvent.keyDown(headingBlock, { key: "Enter" });
      fireEvent.keyDown(headingBlock, { key: "Escape" });
    }
    expect(onActivate).toHaveBeenCalledWith("src:doc-1:p1:e1");
    expect(onEscape).toHaveBeenCalledOnce();
  });
});
