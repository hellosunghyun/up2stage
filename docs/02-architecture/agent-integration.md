# Upstage Agent Integration

Agent v0.22 실행, polling, output adapter를 정의한다.

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

# 21. Processing UX

현재 실제 baseline은 여러 문서 묶음에서 약 2분대가 될 수 있으므로 단순 spinner 금지.

Layout:

```text
현재 페이지
2026년 ...

문서를 분석하고 있어요
문서의 역할과 핵심 정보를 정리합니다.

◌ 처리 중
3 / 5

✓ 공고문.pdf
✓ 자기소개서.hwp
◌ 체크리스트.hwp
· 참고자료.xlsx
· 신청방법.pdf

ⓘ 문서 종류와 분량에 따라 시간이 걸릴 수 있어요.
```

내부 상태:

```ts
type ProcessingPhase =
  | 'uploading'
  | 'submitted'
  | 'processing'
  | 'normalizing'
  | 'indexing'
  | 'complete'
  | 'failed';
```

Agent 내부 node명까지 실시간으로 매핑할 수 있는 경우:

```text
문서 구조 읽는 중
문서 역할 분류 중
주요 정보 정리 중
```

처럼 사용자 친화 copy로 변환한다.

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

---
