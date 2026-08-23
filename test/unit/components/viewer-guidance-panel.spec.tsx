import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ViewerGuidancePanel } from "../../../src/components/document/ViewerGuidancePanel";
import { SourceRegistry } from "../../../src/core/evidence";
import type { DocumentRecord, SourceRecord } from "../../../src/models/canonical";

afterEach(cleanup);

const document: DocumentRecord = {
  id: "doc-1",
  caseId: "case-1",
  fileName: "공고문.hwp",
  extension: "hwp",
  contentHash: "hash",
  renderType: "hwp",
  processingStatus: "complete",
  createdAt: 0
};

const source: SourceRecord = {
  sourceId: "src:requirement",
  caseId: "case-1",
  documentId: "doc-1",
  page: 4,
  elementId: 7,
  category: "paragraph",
  text: "2학년 이상 학부 재학생"
};

describe("ViewerGuidancePanel", () => {
  it("shows summary-first guidance and navigates from an evidence number", async () => {
    const viewer = {
      selectDocument: vi.fn(),
      goToPage: vi.fn().mockResolvedValue(undefined),
      focusSource: vi.fn().mockResolvedValue(undefined),
      outlineSelect: vi.fn(),
      accessibilityFocus: vi.fn()
    };
    const registry = new SourceRegistry().register([source]);

    render(
      <ViewerGuidancePanel
        caseId="case-1"
        guidance={{
          overview: "문서의 핵심 내용을 순서대로 정리했어요.",
          topRequirements: ["2학년 이상 학부 재학생"],
          nearestDeadline: "2026. 3. 31. 16:00",
          requiredSubmissions: ["신청서", "증빙서류"],
          nextActions: ["자격 확인"],
          sourceGroups: {
            topRequirements: [source.sourceId],
            nearestDeadline: [],
            requiredSubmissions: []
          },
          sourceLabels: { [source.sourceId]: "공고문.hwp · p.4" }
        }}
        activeSource={null}
        selectedDocument={document}
        sources={[source]}
        sourceRegistry={registry}
        viewer={viewer}
      />
    );

    expect(screen.getByText("주요 요약")).toBeTruthy();
    expect(screen.getByText("1. 지원 자격")).toBeTruthy();
    expect(screen.getByLabelText("후속 질문 입력").getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "1번 근거로 이동" }));
    await waitFor(() => {
      expect(viewer.selectDocument).toHaveBeenCalledWith("doc-1");
      expect(viewer.goToPage).toHaveBeenCalledWith(4);
      expect(viewer.focusSource).toHaveBeenCalledWith(source);
    });
  });
});
