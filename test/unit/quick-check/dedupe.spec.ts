import { describe, it, expect } from "vitest";
import { dedupeQuickQuestions } from "../../../src/features/quick-check/dedupe";
import { parseQuickQuestions } from "../../../src/features/quick-check/parser";

describe("Quick Question dedupe", () => {
  it("removes a checklist duplicate that maps to a primary question", () => {
    const primary = parseQuickQuestions(
      [
        "key=university_location_type | label=재학 중인 대학교 유형 | type=select | required=true | options=서울 소재, 비서울 소재, 원격대학",
      ],
      "primary_notice"
    );
    const checklist = parseQuickQuestions(
      [
        "key=campus_location_seoul | label=캠퍼스가 서울입니까? | type=boolean | required=true",
      ],
      "requirements_checklist"
    );
    const merged = dedupeQuickQuestions([...primary, ...checklist]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.key).toBe("university_location_type");
    expect(merged[0]?.origin).toBe("primary_notice");
  });

  it("keeps checklist-only questions", () => {
    const primary = parseQuickQuestions(
      [
        "key=university_location_type | label=대학교 유형 | type=select | required=true",
      ],
      "primary_notice"
    );
    const checklist = parseQuickQuestions(
      [
        "key=received_other_foundation_scholarship_2026 | label=타 장학금 수혜 | type=boolean | required=true",
      ],
      "requirements_checklist"
    );
    const merged = dedupeQuickQuestions([...primary, ...checklist]);
    expect(merged).toHaveLength(2);
    const keys = merged.map((q) => q.key);
    expect(keys).toContain("university_location_type");
    expect(keys).toContain("received_other_foundation_scholarship_2026");
  });

  it("prioritizes primary notice over requirements_checklist for same key", () => {
    const primary = parseQuickQuestions(
      [
        "key=income | label=소득 기준 | type=select | required=true",
      ],
      "primary_notice"
    );
    const checklist = parseQuickQuestions(
      [
        "key=income | label=소득 | type=number | required=false",
      ],
      "requirements_checklist"
    );
    const merged = dedupeQuickQuestions([...primary, ...checklist]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.inputType).toBe("select");
    expect(merged[0]?.required).toBe(true);
  });
});
