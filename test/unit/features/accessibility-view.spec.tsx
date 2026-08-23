// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessibilityView } from "../../../src/features/accessibility";
import type { ParseElement, SourceRecord } from "../../../src/models/canonical";

const sourceId = "src:doc-1:p2:e8";
const source: SourceRecord = {
  sourceId,
  caseId: "case-1",
  documentId: "doc-1",
  page: 2,
  elementId: "8",
  category: "heading2",
  text: "신청 방법",
  semanticNodeId: sourceId
};
const parseElement: ParseElement = {
  id: `pe:${sourceId}`,
  caseId: "case-1",
  documentId: "doc-1",
  sourceId,
  elementId: "8",
  category: "heading2",
  type: "heading",
  page: 2,
  text: "신청 방법"
};

afterEach(cleanup);

describe("AccessibilityView", () => {
  it("moves source navigation focus to the linked semantic element", async () => {
    const onSourceFocus = vi.fn();
    render(
      <AccessibilityView
        parseElements={[parseElement]}
        sources={[source]}
        documentId="doc-1"
        documentLabel="공고문.pdf"
        focusRequestId={sourceId}
        onSourceFocus={onSourceFocus}
        onEscape={() => undefined}
      />
    );

    const block = screen.getByRole("heading", { name: "신청 방법" }).parentElement;
    await waitFor(() => expect(block).toHaveFocus());
    expect(onSourceFocus).toHaveBeenCalledWith(source);
  });

  it("announces Enter source selection and restores focus through Escape", () => {
    const onEscape = vi.fn();
    render(
      <AccessibilityView
        parseElements={[parseElement]}
        sources={[source]}
        documentId="doc-1"
        documentLabel="공고문.pdf"
        onSourceFocus={() => undefined}
        onEscape={onEscape}
      />
    );

    const block = screen.getByRole("heading", { name: "신청 방법" }).parentElement;
    if (!block) throw new Error("semantic heading block was not rendered");
    fireEvent.keyDown(block, { key: "Enter" });
    expect(screen.getByText("2쪽 원문 근거를 선택했습니다.")).toBeInTheDocument();
    fireEvent.keyDown(block, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledOnce();
  });
});
