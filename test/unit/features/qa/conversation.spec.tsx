import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QaConversation } from "../../../../src/features/qa";

afterEach(cleanup);

describe("Q&A conversation", () => {
  it("opens the Viewer path from a validated answer source", () => {
    const onSourceClick = vi.fn();
    render(
      <QaConversation
        messages={[
          {
            id: "message-1",
            question: "원격대학도 지원 가능한가요?",
            result: {
              status: "answered",
              origin: "solar",
              answer: "원격대학 재학생은 지원 대상이 아닙니다.",
              evidenceSourceIds: ["src:doc-1:p2:e5"],
              rejectedSourceIds: [],
              missingInformation: [],
              nextActions: []
            }
          }
        ]}
        sourceLabels={{ "src:doc-1:p2:e5": "공고문.pdf · p.2" }}
        onSourceClick={onSourceClick}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /공고문.pdf · p.2/ }));
    expect(onSourceClick).toHaveBeenCalledWith("src:doc-1:p2:e5");
  });

  it("shows insufficient evidence without a source link", () => {
    render(
      <QaConversation
        messages={[
          {
            id: "message-2",
            question: "문서에 없는 질문",
            result: {
              status: "insufficient_evidence",
              origin: "solar",
              answer: "insufficient evidence",
              evidenceSourceIds: [],
              rejectedSourceIds: [],
              missingInformation: ["추가 문서"],
              nextActions: []
            }
          }
        ]}
        sourceLabels={{}}
        onSourceClick={() => {}}
      />
    );
    expect(screen.getByText("insufficient evidence")).toBeTruthy();
    expect(screen.queryByLabelText("답변 근거")).toBeNull();
  });
});
