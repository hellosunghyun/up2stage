import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { QuickQuestionForm } from "../../../src/features/quick-check/QuickQuestionForm";
import type { QuickQuestion } from "../../../src/core/decision/types";

const QUESTIONS: QuickQuestion[] = [
  {
    id: "q1",
    caseId: "case-test",
    key: "university_location",
    label: "대학교 유형",
    inputType: "select",
    required: true,
    options: ["서울 소재", "비서울 소재"],
    ruleText: "서울 소재 또는 비서울 소재",
    origin: "primary_notice",
    sourceIds: [],
  },
  {
    id: "q2",
    caseId: "case-test",
    key: "is_seoul_citizen",
    label: "서울시민",
    inputType: "boolean",
    required: true,
    ruleText: "서울시민 여부 확인",
    origin: "primary_notice",
    sourceIds: [],
  },
  {
    id: "q3",
    caseId: "case-test",
    key: "score",
    label: "성적",
    inputType: "number",
    required: false,
    ruleText: "90점 이상",
    origin: "primary_notice",
    sourceIds: [],
  },
];

describe("QuickQuestionForm", () => {
  it("renders select options from Agent", () => {
    const onChange = vi.fn();
    render(
      <QuickQuestionForm
        questions={QUESTIONS}
        answers={{}}
        onChange={onChange}
        onSubmit={() => {}}
      />
    );
    const select = screen.getByDisplayValue("선택하세요");
    fireEvent.change(select, { target: { value: "비서울 소재" } });
    expect(onChange).toHaveBeenCalledWith("q1", "비서울 소재");
  });

  it("displays required and optional badges", () => {
    render(
      <QuickQuestionForm
        questions={QUESTIONS}
        answers={{}}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );
    expect(screen.getAllByText("필수")).toHaveLength(2);
    expect(screen.getByText("모르면 비워도 돼요")).toBeTruthy();
  });

  it("toggles 왜 묻나요? explanation", () => {
    render(
      <QuickQuestionForm
        questions={QUESTIONS}
        answers={{}}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );
    const toggle = screen.getAllByText("왜 묻나요? ▼")[0]!;
    fireEvent.click(toggle);
    expect(screen.getByText(QUESTIONS[0]!.ruleText!)).toBeTruthy();
  });

  it("submits after input", () => {
    const onSubmit = vi.fn();
    render(
      <QuickQuestionForm
        questions={QUESTIONS}
        answers={{ q1: "비서울 소재" }}
        onChange={() => {}}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByText("입력 완료"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
