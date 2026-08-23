import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProcessingView } from "../../../../src/features/processing/ProcessingView";
import type { ProcessingProgress } from "../../../../src/core/agent/processor";
import type { DocumentRecord } from "../../../../src/models/canonical";

const docs: DocumentRecord[] = [
  {
    id: "d1",
    caseId: "c1",
    fileName: "공고문.pdf",
    extension: "pdf",
    contentHash: "h1",
    upstageFileId: "f1",
    renderType: "pdf",
    processingStatus: "uploaded",
    createdAt: 0,
  },
  {
    id: "d2",
    caseId: "c1",
    fileName: "신청서.pdf",
    extension: "pdf",
    contentHash: "h2",
    renderType: "pdf",
    processingStatus: "uploading",
    createdAt: 0,
  },
];

const progress = (overall: ProcessingProgress["overall"]): ProcessingProgress => ({
  caseId: "c1",
  overall,
  documents: docs,
  message: "처리 중",
});

describe("ProcessingView", () => {
  it("shows document list with upload counts", () => {
    render(<ProcessingView progress={progress("preparing")} onReset={() => {}} />);
    expect(screen.getByText("공고문.pdf")).toBeInTheDocument();
    expect(screen.getByText("신청서.pdf")).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 2 문서/)).toBeInTheDocument();
  });

  it("does not render percentage progress", () => {
    render(<ProcessingView progress={progress("processing")} onReset={() => {}} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("shows failed state with reset button", () => {
    render(<ProcessingView progress={progress("failed")} onReset={() => {}} />);
    expect(screen.getByRole("button", { name: /처음으로/ })).toBeInTheDocument();
  });

  it("shows completed message", () => {
    render(<ProcessingView progress={progress("complete")} onReset={() => {}} />);
    expect(screen.getByText(/분석이 완료/)).toBeInTheDocument();
  });
});
