import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { InitialGuidanceView } from "../../../src/features/guidance/InitialGuidanceView";
import type {
  InitialGuidance,
  PrimaryNoticeExtract,
  ApplicationFormExtract,
  ProcedureExtract,
} from "../../../src/features/guidance/types";

const GUIDANCE: InitialGuidance = {
  overview: "서울미래인재재단 장학금 공고입니다.",
  topRequirements: ["서울 소재 대학교 재학생"],
  nearestDeadline: "2026. 8. 10.(월) 15:00",
  requiredSubmissions: ["온라인 신청서"],
  topCautions: ["마감 시간 이후 신청 불가"],
  nextActions: ["로그인"],
  missingInformation: ["거주 조건"],
  personalizationStatus: "not_evaluated",
};

const PRIMARY: PrimaryNoticeExtract = {
  title: "2026년 하반기 서울인재대학장학금",
  issuer: "서울미래인재재단",
  benefits_or_outcomes: ["연간 200만원"],
  key_dates: [
    "신청기간: 2026. 8. 3. 10:00",
    "마감: 2026. 8. 10. 15:00",
    "결과 발표: 2026. 9. 30.",
  ],
  key_requirements: ["서울 소재"],
  required_submissions: ["온라인 신청서"],
  conditional_submissions: ["주민등록 등본 | 서울시민"],
  quick_questions: [],
  critical_cautions: ["마감 이후 접수 불가"],
  next_actions_seed: ["로그인"],
};

const FORM: ApplicationFormExtract = {
  form_title: "자기소개서",
  form_type: "essay",
  required_fields: ["성명", "학과"],
  required_signatures: [],
  required_attachments: [],
  format_constraints: ["1~2페이지"],
  form_cautions: ["학교명 기재 금지"],
};

const PROCEDURE: ProcedureExtract = {
  guide_title: "신청방법 안내",
  steps: ["로그인", "신청"],
  channels: ["홈페이지"],
  file_rules: ["hwp 30MB"],
  completion_checks: ["신청 완료"],
  procedure_cautions: ["임시저장은 완료 아님"],
};

describe("InitialGuidanceView", () => {
  it("renders overview and sections", () => {
    render(
      <InitialGuidanceView
        guidance={GUIDANCE}
        primaryNotice={PRIMARY}
        onQuickCheck={() => {}}
      />
    );
    expect(screen.getByText("문서를 모두 확인했어요")).toBeTruthy();
    expect(screen.getByText("주요 조건")).toBeTruthy();
    expect(screen.getByText("가장 가까운 마감")).toBeTruthy();
    expect(screen.getByText("필수 제출물")).toBeTruthy();
    expect(screen.getByText("놓치면 안 되는 것")).toBeTruthy();
    expect(screen.getByText("지금 해야 할 일")).toBeTruthy();
    expect(screen.getByText("확인 필요")).toBeTruthy();
  });

  it("shows timeline when there are more than two dates", () => {
    render(
      <InitialGuidanceView
        guidance={GUIDANCE}
        primaryNotice={PRIMARY}
        onQuickCheck={() => {}}
      />
    );
    expect(screen.getByText("일정")).toBeTruthy();
    expect(screen.getByText("마감: 2026. 8. 10. 15:00")).toBeTruthy();
  });

  it("calls onQuickCheck when CTA is clicked", () => {
    const onQuickCheck = vi.fn();
    render(
      <InitialGuidanceView
        guidance={GUIDANCE}
        primaryNotice={PRIMARY}
        onQuickCheck={onQuickCheck}
      />
    );
    fireEvent.click(screen.getByText("내 조건 확인하기 →"));
    expect(onQuickCheck).toHaveBeenCalled();
  });

  it("renders application form and procedure cards", () => {
    render(
      <InitialGuidanceView
        guidance={GUIDANCE}
        primaryNotice={PRIMARY}
        applicationForm={FORM}
        procedure={PROCEDURE}
        onQuickCheck={() => {}}
      />
    );
    expect(screen.getByText("자기소개서 작성 전 확인")).toBeTruthy();
    expect(screen.getByText("신청방법 안내")).toBeTruthy();
  });

  it("opens a canonical source from a Guidance card", () => {
    const onSourceClick = vi.fn();
    render(
      <InitialGuidanceView
        guidance={GUIDANCE}
        primaryNotice={PRIMARY}
        sourceGroups={{
          overview: [],
          topRequirements: ["src:doc-notice:p2:e7"],
          nearestDeadline: [],
          requiredSubmissions: [],
          topCautions: [],
          nextActions: [],
          keyDates: [],
          applicationForm: [],
          procedure: [],
        }}
        onQuickCheck={() => {}}
        onSourceClick={onSourceClick}
      />
    );

    fireEvent.click(screen.getByText("src:doc-notice:p2:e7"));
    expect(onSourceClick).toHaveBeenCalledWith("src:doc-notice:p2:e7");
  });
});
