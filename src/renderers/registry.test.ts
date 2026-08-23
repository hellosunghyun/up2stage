import { describe, expect, it, vi } from "vitest";
import type { DocumentRecord } from "../models/canonical";
import { createRenderer } from "./registry";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(() => ({ promise: Promise.resolve({ numPages: 1, getPage: vi.fn() }) })),
}));

function doc(renderType: DocumentRecord["renderType"]): DocumentRecord {
  return {
    id: `doc_${renderType}`,
    caseId: "case_test",
    fileName: `test.${renderType}`,
    extension: renderType,
    contentHash: "sha256-test",
    renderType,
    processingStatus: "complete",
    createdAt: 0,
  };
}

describe("createRenderer", () => {
  it("creates a pdf renderer for pdf documents", () => {
    const renderer = createRenderer(doc("pdf"), new ArrayBuffer(0));
    expect(renderer.supports(doc("pdf"))).toBe(true);
    expect(renderer.supports(doc("xlsx"))).toBe(false);
  });

  it("creates a hwp renderer for hwp and hwpx", () => {
    const hwp = createRenderer(doc("hwp"), new ArrayBuffer(0));
    expect(hwp.supports(doc("hwp"))).toBe(true);
    expect(hwp.supports(doc("hwpx"))).toBe(true);
    expect(hwp.supports(doc("pdf"))).toBe(false);

    const hwpx = createRenderer(doc("hwpx"), new ArrayBuffer(0));
    expect(hwpx.supports(doc("hwpx"))).toBe(true);
  });

  it("creates an xlsx renderer for xlsx documents", () => {
    const xlsx = createRenderer(doc("xlsx"), new ArrayBuffer(0));
    expect(xlsx.supports(doc("xlsx"))).toBe(true);
    expect(xlsx.supports(doc("pdf"))).toBe(false);
  });

  it("creates an unsupported renderer for unsupported documents", () => {
    const unsupported = createRenderer(doc("unsupported"), new ArrayBuffer(0));
    expect(unsupported.supports(doc("unsupported"))).toBe(true);
    expect(unsupported.supports(doc("pdf"))).toBe(false);
  });
});
