import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ViewerShell } from "../../../src/components/document/ViewerShell";
import { SourceRegistry } from "../../../src/core/evidence";
import type { DocumentRecord, SourceRecord } from "../../../src/models/canonical";

vi.mock("../../../src/renderers/registry", () => ({
  createRenderer: () => ({
    supports: () => true,
    mount: vi.fn().mockResolvedValue(undefined),
    goToPage: vi.fn().mockResolvedValue(undefined),
    focusSource: vi.fn().mockResolvedValue(undefined),
    setZoom: vi.fn(),
    destroy: vi.fn()
  })
}));

afterEach(cleanup);

const document: DocumentRecord = {
  id: "doc-1",
  caseId: "case-1",
  fileName: "공고문.unsupported",
  extension: "unsupported",
  contentHash: "hash",
  renderType: "unsupported",
  processingStatus: "complete",
  createdAt: 0
};

const source: SourceRecord = {
  sourceId: "src:doc-1:p1:e1",
  caseId: "case-1",
  documentId: "doc-1",
  page: 1,
  elementId: 1,
  category: "paragraph",
  text: "원문 근거"
};

describe("ViewerShell layout", () => {
  it("renders only Outline and Document Workspace without a Guidance sidebar", () => {
    const registry = new SourceRegistry().register([source]);
    const { container } = render(
      <ViewerShell
        documents={[document]}
        sources={[source]}
        parseElements={[]}
        documentBytes={new Map([[document.id, new ArrayBuffer(0)]])}
        sourceRegistry={registry}
        initialDocumentId={document.id}
        initialSourceId={undefined}
      />
    );

    const shell = container.firstElementChild as HTMLElement;
    expect(shell.style.gridTemplateColumns).toBe("224px minmax(0, 1fr)");
    expect(screen.getByText("문서 목차")).toBeTruthy();
    expect(screen.queryByText("주요 요약")).toBeNull();
    expect(container.querySelectorAll("aside")).toHaveLength(1);

    fireEvent.click(screen.getByRole("tab", { name: "구조 보기" }));
    expect(screen.getByRole("heading", { name: "문서 구조" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "원문 근거" })).toBeTruthy();
  });
});
