import { describe, it, expect } from "vitest";
import {
  evaluateQuestion,
  evaluateDecision,
} from "../../../../src/core/decision/evaluate";
import type { QuickQuestion } from "../../../../src/core/decision/types";

function q(inputType: QuickQuestion["inputType"], ruleText: string, required = true): QuickQuestion {
  return {
    id: inputType,
    caseId: "case-test",
    key: inputType,
    label: "테스트",
    inputType,
    required,
    ruleText,
    sourceIds: ["src:test"],
    origin: "primary_notice",
  };
}

describe("deterministic evaluator", () => {
  it("passes when number is greater than or equal to threshold", () => {
    const question = q("number", "성적이 90점 이상");
    const result = evaluateQuestion(question, 92);
    expect(result.status).toBe("pass");
    expect(result.reason).toContain("≥");
  });

  it("fails when number is below threshold", () => {
    const question = q("number", "성적이 90점 이상");
    const result = evaluateQuestion(question, 85);
    expect(result.status).toBe("fail");
  });

  it("passes at_most threshold", () => {
    const question = q("number", "학자금 지원구간 4구간 이하");
    const result = evaluateQuestion(question, 3);
    expect(result.status).toBe("pass");
  });

  it("fails at_most threshold", () => {
    const question = q("number", "학자금 지원구간 4구간 이하");
    const result = evaluateQuestion(question, 5);
    expect(result.status).toBe("fail");
  });

  it("treats null as needs_more_information", () => {
    const question = q("number", "성적이 90점 이상");
    const result = evaluateQuestion(question, null);
    expect(result.status).toBe("needs_more_information");
    expect(result.reason).toContain("아직");
  });

  it("passes boolean when answer matches expected", () => {
    const question = q("boolean", "2026년 2학기 정규등록이 가능한 1학년 대학생");
    const result = evaluateQuestion(question, true);
    expect(result.status).toBe("pass");
  });

  it("fails boolean when expected is false and answer is true", () => {
    const question = q("boolean", "2026년 내 재단 타 장학금 수혜 사실이 없을 것");
    const result = evaluateQuestion(question, true);
    expect(result.status).toBe("fail");
  });

  it("passes select when chosen keyword is in rule", () => {
    const question: QuickQuestion = {
      ...q("select", "기초생활수급자, 법정차상위계층 또는 학자금 지원구간 4구간 이하"),
      options: ["기초생활수급자", "법정차상위계층", "학자금 지원구간 4구간 이하", "해당 없음"],
    };
    const result = evaluateQuestion(question, "법정차상위계층");
    expect(result.status).toBe("pass");
  });

  it("fails select when chosen option contains ineligible keyword", () => {
    const question: QuickQuestion = {
      ...q("select", "기초생활수급자, 법정차상위계층 또는 학자금 지원구간 4구간 이하"),
      options: ["기초생활수급자", "법정차상위계층", "학자금 지원구간 4구간 이하", "해당 없음"],
    };
    const result = evaluateQuestion(question, "해당 없음");
    expect(result.status).toBe("fail");
  });

  it("returns eligible when all answers pass", () => {
    const questions = [
      q("number", "성적이 90점 이상"),
      q("boolean", "2026년 2학기 정규등록이 가능한 1학년 대학생"),
    ];
    const result = evaluateDecision(questions, { number: 92, boolean: true });
    expect(result.status).toBe("eligible");
  });
});
