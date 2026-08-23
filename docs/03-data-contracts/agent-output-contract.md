# Agent Output Contract

실제 v0.22 결과를 canonical guidance와 facts로 변환하는 기준이다.

# 18. Agent v0.22 Contract

Agent는 확정본으로 취급한다.

```text
Parse
→ Classify + Split
→ Role-specific Extract
→ Initial Guidance Instruct
```

Document Role:

```text
primary_notice
requirements_checklist
application_form
procedure_guide
reference_material
amendment_update
other
```

---

---

# 19. Agent Extract Schema

## 19.1 `primary_notice_extract`

```text
title
issuer
benefits_or_outcomes
key_dates
key_requirements
required_submissions
conditional_submissions
quick_questions
critical_cautions
next_actions_seed
contacts
```

이 schema가 Initial Guidance와 첫 Quick Action의 주요 source다.

---

## 19.2 `requirements_checklist_extract`

```text
document_title
requirements
exclusions_or_failure_conditions
exceptions
required_evidence
quick_questions
cautions
```

Quick Question을 보강하고 조건 판정에서 사용한다.

---

## 19.3 `application_form_extract`

```text
form_title
form_type
required_fields
required_signatures
required_attachments
format_constraints
form_cautions
```

이 결과는 Viewer에서 `작성 전 확인` UI로 사용한다.

---

## 19.4 `procedure_extract`

```text
guide_title
steps
channels
file_rules
completion_checks
procedure_cautions
```

이 결과는 `신청 방법`, `지금 해야 할 일`, `완료 확인` 등에 사용한다.

---

## 19.5 `amendment_extract`

```text
target_document
effective_date
changes
superseded_items
amendment_cautions
```

명시적인 정정 문서가 있는 경우 Source precedence에 사용한다.

---

## 19.6 `reference_material`

대량 목록, FAQ, 표, 카탈로그는 전체 Extract하지 않는다.

```text
Parse
→ reference_material
→ Extension SectionChunker/Search
```

---

---

# 20. Agent 실행

Side Panel에서 selected files를 업로드한 뒤 Agent Job 생성.

결과 조회는 반드시 전체 node 결과를 사용할 수 있게 한다.

개념:

```text
job
include=all
```

Extension에서 필요한 것은:

```text
Parse output
Classify output
Extract output
Instruct output
```

전부다.

---

---

# 22. Agent Output Adapter

Upstage 응답 형식을 UI가 직접 소비하지 않는다.

```text
Raw Agent Job
↓
AgentOutputAdapter
↓
Canonical Case Data
```

Adapter 책임:

1. Parse output 찾기
2. Classify 결과를 각 file/document와 연결
3. role-specific Extract 찾기
4. `additional_values` JSON parse
5. location / confidence 분리
6. Instruct initial guidance parse
7. citation mapping 추출
8. canonical model 저장

통합 이후 feature가 소비하는 단일 결과 계약:

```ts
export interface CanonicalAgentResult {
  caseId: string;
  agentJobId: string;
  status: 'completed' | 'failed';
  completedAt: number;
  documents: DocumentRecord[];
  parseElements: ParseElement[];
  sources: SourceRecord[];
  extracts: ExtractRecord[];
  guidance: GuidanceRecord | null;
  quickQuestions: QuickQuestionRecord[];
}
```

Side Panel, Guidance, Quick Check, Evidence, Viewer는 raw Agent Job을 직접 파싱하지 않는다. IndexedDB의 canonical table을 조합한 이 결과 또는 전용 adapter를 사용한다.

---

---

# 26. Initial Guidance

Instruct output:

```ts
export interface InitialGuidance {
  overview: string;
  topRequirements: string[];
  nearestDeadline: string;
  requiredSubmissions: string[];
  topCautions: string[];
  nextActions: string[];
  missingInformation: string[];
  personalizationStatus: 'not_evaluated';
}
```

화면:

```text
✓ 문서를 모두 확인했어요
이 문서 묶음의 일정, 제출물과 주요 조건을 정리했어요.

┌ 주요 조건
│ ...
│ 공고문.pdf · p.2
└

┌ 가장 가까운 마감
│ ...
└

┌ 필수 제출물
│ ...
└

┌ 내 상황에 맞는지도 확인할까요?
│ ...
│ [내 조건 확인하기 →]
└
```

---
