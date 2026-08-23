import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuickConfirm } from "../../../src/features/quick-check/QuickConfirm";
import { Breakdown } from "../../../src/features/quick-check/Breakdown";
import type { QuickQuestion } from "../../../src/core/decision/types";

afterEach(cleanup);

const question: QuickQuestion = {
  id: "q1",
  caseId: "case-1",
  key: "grade",
  label: "학년",
  inputType: "number",
  required: true,
  ruleText: "2학년 이상",
  origin: "primary_notice",
  sourceIds: ["src:grade"]
};

describe("quick check confirmation and decision overview", () => {
  it("requires consent before starting the decision", () => {
    const onConfirm = vi.fn();
    render(
      <QuickConfirm
        questions={[question]}
        answers={{ q1: 2 }}
        onConfirm={onConfirm}
        onBack={() => {}}
      />
    );

    const button = screen.getByRole("button", {
      name: "이 정보로 분석 시작하기"
    });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(button.hasAttribute("disabled")).toBe(false);
    fireEvent.click(button);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("summarizes pass and unresolved conditions before the details", () => {
    const onMissingClick = vi.fn();
    const onSourceClick = vi.fn();
    render(
      <Breakdown
        result={{
          status: "needs_more_information",
          overallReason: "추가 정보가 필요합니다.",
          breakdown: [
            {
              questionId: "q1",
              questionKey: "grade",
              label: "학년",
              input: 2,
              criterion: "2학년 이상",
              status: "pass",
              reason: "조건을 충족합니다.",
              sourceIds: ["src:grade"]
            },
            {
              questionId: "q2",
              questionKey: "residency",
              label: "거주 조건",
              input: null,
              criterion: "서울 거주",
              status: "needs_more_information",
              reason: "아직 입력하지 않았어요.",
              sourceIds: ["src:residency"]
            }
          ]
        }}
        guidance={{
          nearestDeadline: "2026. 3. 31. 16:00",
          requiredSubmissions: ["신청서", "증빙서류"],
          nextActions: ["자격 확인", "온라인 접수"]
        }}
        sourceLabels={{ "src:residency": "공고문.hwp · p.4" }}
        onMissingClick={onMissingClick}
        onSourceClick={onSourceClick}
      />
    );

    expect(screen.getByText("충족 1")).toBeTruthy();
    expect(screen.getByText("확인 필요 1")).toBeTruthy();
    fireEvent.click(screen.getByText("입력하기"));
    expect(onMissingClick).toHaveBeenCalledWith("q2");
    fireEvent.click(screen.getAllByText("공고문.hwp · p.4")[0]!);
    expect(onSourceClick).toHaveBeenCalledWith("src:residency");
  });
});
