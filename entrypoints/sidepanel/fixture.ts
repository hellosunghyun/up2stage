import type { QuickQuestion } from "../../src/core/decision/types";
import type {
  InitialGuidance,
  PrimaryNoticeExtract,
  ApplicationFormExtract,
  ProcedureExtract,
} from "../../src/features/guidance/types";

export const DEMO_INITIAL_GUIDANCE: InitialGuidance = {
  overview:
    "2026년 하반기 서울인재대학장학금 장학생 선발 공고입니다. 서울미래인재재단에서 1학년 대학생을 대상으로 생활비성 장학금을 선발합니다.",
  topRequirements: [
    "서울 소재 대학교 재학생 또는 서울시민(의 자녀)으로 비서울 소재 대학교 재학생",
    "2026년 2학기 정규등록이 가능한 1학년 대학생",
    "기초생활수급자, 법정차상위계층 또는 2026년 2학기(또는 2026년 1학기) 학자금 지원구간 4구간 이하인 자",
    "1학년 1학기 평점 평균의 백분위(백분율) 성적이 90점 이상",
  ],
  nearestDeadline: "2026. 8. 10.(월) 15:00",
  requiredSubmissions: [
    "온라인 신청서 작성",
    "소득 증빙 서류 (Ⓐ 또는 Ⓑ 중 하나 선택)",
    "자기소개서(온라인 신청 시, hwp파일 업로드)",
    "성적증명서(온라인 신청 시 PDF파일 업로드)",
  ],
  topCautions: [
    "마감 이후 접수는 인정되지 않습니다.",
    "제출 후 수정이 제한될 수 있습니다.",
    "시스템 오류 관련 문의는 마감 1시간 전인 14:00까지만 가능합니다.",
    "학교를 특정할 수 있는 정보(학교명, 로고 등)는 자기소개서에 기재하지 마세요.",
  ],
  nextActions: [
    "지원 조건 확인",
    "자기소개서 작성",
    "증빙서류 준비",
    "최종 제출",
  ],
  missingInformation: ["거주 조건", "소득 구간"],
  personalizationStatus: "not_evaluated",
};

export const DEMO_PRIMARY_NOTICE: PrimaryNoticeExtract = {
  title: "2026년 하반기 서울인재대학장학금 장학생 선발 공고",
  issuer: "서울미래인재재단",
  benefits_or_outcomes: [
    "총 228명 내외",
    "연간 200만원(1회 지급)",
    "학업장려금(생활비성 장학금으로, 타 기관 장학금과 중복수혜 가능함)",
    "2026년 2학기",
  ],
  key_dates: [
    "신청기간: 2026. 8. 3.(월) 10:00~8. 10.(월) 15:00 까지",
    "최종 선정 결과 발표: 2026. 9. 30.(수) 예정",
    "지급일정: 2026년 10월 예정",
    "마감 시한: 2026. 8. 10.(월) 15:00:00 (정시 차단)",
  ],
  key_requirements: [
    "서울 소재 대학교 재학생 또는 서울시민(의 자녀)으로 비서울 소재 대학교 재학생",
    "2026년 2학기 정규등록이 가능한 1학년 대학생",
    "기초생활수급자, 법정차상위계층 또는 2026년 2학기(또는 2026년 1학기) 학자금 지원구간 4구간 이하인 자",
    "1학년 1학기 평점 평균의 백분위(백분율) 성적이 90점 이상",
  ],
  required_submissions: [
    "온라인 신청서 작성",
    "소득 증빙 서류 (Ⓐ 또는 Ⓑ 중 하나 선택)",
    "자기소개서(온라인 신청 시, hwp파일 업로드)",
    "성적증명서(온라인 신청 시 PDF파일 업로드)",
  ],
  conditional_submissions: [
    "주민등록 등본 | 신청자격 ①의 '서울시민(의 자녀)' 에 해당하는 자",
    "가족관계증명서 | 기초생활수급자 또는 법정차상위계층 해당 자",
  ],
  quick_questions: [],
  critical_cautions: [
    "마감 이후 접수는 인정되지 않습니다.",
    "제출 후 수정이 제한될 수 있습니다.",
    "학교명/로고 노출 금지",
    "임시저장은 완료 아님",
  ],
  next_actions_seed: ["지원 조건 확인", "서류 준비", "온라인 제출"],
};

export const DEMO_APPLICATION_FORM: ApplicationFormExtract = {
  form_title: "자기소개서",
  form_type: "essay",
  required_fields: [
    "성명",
    "학과",
    "학번",
    "지원 동기",
    "진로 계획",
    "역량 개발 의지",
  ],
  required_signatures: [],
  required_attachments: [],
  format_constraints: ["1~2페이지", "글꼴 11pt", "줄간격 160%"],
  form_cautions: [
    "학교명/로고 노출 금지",
    "안내문/예시는 제출 전 삭제",
  ],
};

export const DEMO_PROCEDURE: ProcedureExtract = {
  guide_title: "신청 방법",
  steps: [
    "홈페이지 로그인",
    "신청 페이지 이동",
    "신청정보 입력",
    "증빙 파일 업로드",
    "최종 제출",
    "완료 상태 확인",
  ],
  channels: ["서울미래인재재단 홈페이지"],
  file_rules: ["hwp/hwpx", "pdf"],
  completion_checks: ["'신청 완료' 상태 확인"],
  procedure_cautions: [
    "임시저장은 완료가 아닙니다.",
    "마감 시간 전 반드시 최종 제출을 확인하세요.",
  ],
};

export const DEMO_QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: "qq_university_location",
    caseId: "case-demo",
    sourceIds: [],
    key: "university_location_type",
    label: "재학 중인 대학교 유형",
    inputType: "select",
    required: true,
    options: ["서울 소재", "비서울 소재", "원격대학"],
    ruleText:
      "서울 소재 대학교 재학생 또는 서울시민(의 자녀)으로 비서울 소재 대학교 재학생",
    origin: "primary_notice",
  },
  {
    id: "qq_seoul_citizen",
    caseId: "case-demo",
    sourceIds: [],
    key: "is_seoul_citizen",
    label: "본인 또는 부모가 서울시민인가요?",
    inputType: "boolean",
    required: true,
    ruleText: "서울시민(의 자녀) 조건",
    origin: "primary_notice",
  },
  {
    id: "qq_grade",
    caseId: "case-demo",
    sourceIds: [],
    key: "percentile_score",
    label: "1학년 1학기 백분위 성적",
    inputType: "number",
    required: true,
    ruleText: "1학년 1학기 평점 평균의 백분위 성적이 90점 이상",
    origin: "requirements_checklist",
  },
  {
    id: "qq_income",
    caseId: "case-demo",
    sourceIds: [],
    key: "income_bracket",
    label: "학자금 지원구간",
    inputType: "number",
    required: true,
    ruleText: "2026년 2학기(또는 2026년 1학기) 학자금 지원구간 4구간 이하",
    origin: "requirements_checklist",
  },
  {
    id: "qq_other_scholarship",
    caseId: "case-demo",
    sourceIds: [],
    key: "received_other_foundation_scholarship_2026",
    label: "2026년 내 재단 타 장학금 수혜 사실이 있나요?",
    inputType: "boolean",
    required: true,
    ruleText: "2026년 내 재단 타 장학금 수혜 사실이 없음",
    origin: "requirements_checklist",
  },
  {
    id: "qq_submission_date",
    caseId: "case-demo",
    sourceIds: [],
    key: "planned_submission_date",
    label: "제출 예정일",
    inputType: "date",
    required: false,
    ruleText: "마감 시한: 2026. 8. 10. 15:00:00",
    origin: "primary_notice",
  },
];
