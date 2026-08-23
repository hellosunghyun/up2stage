import { describe, it, expect } from "vitest";
import {
  parseQuickQuestion,
  parseQuickQuestions,
} from "../../../src/features/quick-check/parser";

describe("Quick Question parser", () => {
  it("parses a compact select question with options", () => {
    const line =
      "key=university_location_type | label=재학 중인 대학교 유형 | type=select | required=true | options=서울 소재, 비서울 소재, 원격대학 | rule=서울 소재 대학교 재학생";
    const q = parseQuickQuestion(line, "primary_notice", 0);
    expect(q.key).toBe("university_location_type");
    expect(q.label).toBe("재학 중인 대학교 유형");
    expect(q.inputType).toBe("select");
    expect(q.required).toBe(true);
    expect(q.options).toEqual(["서울 소재", "비서울 소재", "원격대학"]);
    expect(q.ruleText).toBe("서울 소재 대학교 재학생");
    expect(q.origin).toBe("primary_notice");
  });

  it("parses a compact boolean question without options", () => {
    const line =
      "key=is_seoul_citizen | label=본인 또는 부모가 서울시민인가요? | type=boolean | required=true | options= | rule=서울시민 기준";
    const q = parseQuickQuestion(line, "primary_notice", 0);
    expect(q.inputType).toBe("boolean");
    expect(q.required).toBe(true);
    expect(q.options).toBeUndefined();
    expect(q.ruleText).toBe("서울시민 기준");
  });

  it("parses a number question", () => {
    const line =
      "key=percentile_score | label=성적은 몇 점인가요? | type=number | required=true | options= | rule=1학년 1학기 평점 평균의 백분위 성적이 90점 이상";
    const q = parseQuickQuestion(line, "primary_notice", 0);
    expect(q.inputType).toBe("number");
    expect(q.required).toBe(true);
  });

  it("treats unknown type as text fallback", () => {
    const line =
      "key=foo | label=입력 | type=unknown | required=false | options= | rule=";
    const q = parseQuickQuestion(line, "requirements_checklist", 1);
    expect(q.inputType).toBe("text");
    expect(q.required).toBe(false);
    expect(q.key).toBe("foo");
  });

  it("skips empty lines", () => {
    const lines = ["", "  ", "key=a | label=A | type=text | required=false"];
    const qs = parseQuickQuestions(lines, "primary_notice");
    expect(qs).toHaveLength(1);
    expect(qs[0]?.label).toBe("A");
  });

  it("keeps broken questions with text fallback", () => {
    const lines = ["this is broken"];
    const qs = parseQuickQuestions(lines, "requirements_checklist");
    expect(qs).toHaveLength(1);
    expect(qs[0]?.inputType).toBe("text");
    expect(qs[0]?.required).toBe(false);
  });
});
