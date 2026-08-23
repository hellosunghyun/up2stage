# Side Panel 상세 Spec

443px 기준 shell, 상태 전이, 결과·QQ·Decision UI를 정의한다.

# 12. Side Panel 공통 Layout

Figma 기준 Side Panel 폭은 약 `443px`.

내부 주요 폭:

```text
Panel width       443px
Horizontal inset   20~24px
Content width     395~403px
```

실제 브라우저에서는 폭이 변경될 수 있으므로 고정 px가 아니라 아래 규칙을 사용한다.

```css
.side-panel {
  width: 100%;
  min-width: 360px;
}
```

## 12.1 Shell

```tsx
<SidePanelShell>
  <PanelHeader />
  <PanelMain />
  <PanelBottom />
</SidePanelShell>
```

### Header
- 높이 약 64px
- 좌측: up to stage mark + name
- 우측: More menu
- 고정

### Main
- `overflow-y: auto`
- 상태별 화면 전환

### Bottom
결과 이후에는 공통으로 유지:

- Suggestion Chips
- Chat Composer

---

---

# 13. Side Panel State Machine

```ts
export type PanelState =
  | 'SETUP'
  | 'DISCOVERY'
  | 'SELECTION'
  | 'CONSENT_CONFIRM'
  | 'PROCESSING'
  | 'GUIDANCE'
  | 'QUICK_FORM'
  | 'QUICK_CONFIRM'
  | 'DECISION'
  | 'CHAT';
```

전이:

```text
SETUP
  ↓
DISCOVERY
  ↓
SELECTION
  ↓
CONSENT_CONFIRM
  ↓
PROCESSING
  ↓
GUIDANCE
  ├── QUICK_FORM
  │      ↓
  │   QUICK_CONFIRM
  │      ↓
  │   DECISION
  │
  └── CHAT
```

---

---

# 14. API Key Setup

API Key가 없는 경우에만 표시.

Layout:

```text
Kim님,
선택한 문서를 분석할 수 있도록
Upstage를 연결해 주세요.

API Key
[••••••••••••]

? API Key는 어디서 찾나요?
ⓘ 이 키를 입력하면 무엇이 연결되나요?

[연결하기]
```

저장:

```text
chrome.storage.session
```

장기 sync storage에 key를 저장하지 않는 방향을 기본으로 한다.

---

---

# 15. Discovery 화면

목표:

> 현재 페이지와 연결된 문서를 발견했다는 것을 설명한다.

Layout:

```text
◆ 복잡한 공고 문서, 바로 정리해볼까요?

직접 열어볼 필요 없이
관련 문서를 함께 분석할 수 있어요.

[PDF] 공고문.pdf
[HWP] 자기소개서.hwp
[XLSX] 참고 목록.xlsx
...

[문서 선택하기]
```

문서 chip은 discovery preview일 뿐 이 시점에서 업로드하지 않는다.

---

---

# 16. Selection 화면

Figma 핵심 구조를 그대로 따른다.

```text
2개 선택됨

함께 분석할 문서를 골라주세요.

현재 페이지와 관련된 문서는
여러 개를 함께 선택해도 괜찮아요.

☑ 공고문.pdf
☑ 신청방법 안내.pdf
☐ 자기소개서.hwp
☐ 체크리스트.hwp
☐ 참고 목록.xlsx

ⓘ 선택한 문서는 Upstage AI로 전송되어 분석됩니다.

[선택한 문서 분석하기]
```

CTA는 bottom-fixed 영역에 배치한다.

---

---

# 17. Consent Confirm

분석 직전 명확한 전송 고지.

```text
선택한 문서를 확인해주세요.

공고문.pdf
체크리스트.hwp
신청방법 안내.pdf

이 문서는 Upstage를 통해 처리됩니다.

☑ 위 문서를 AI 처리에 사용하는 데 동의합니다.

[분석 시작]
```

이 화면을 Selection 안의 notice와 통합할 수도 있지만, 현재 설계에서는 명시적 확인 화면을 유지하는 편이 좋다.

---

---

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

---

# 23. Source Registry

up to stage의 핵심 데이터 구조.

Parse Element를 받은 직후 Source ID를 생성한다.

```text
src:{documentId}:p{page}:e{elementId}
```

예:

```text
src:doc_abc:p2:e35
```

```ts
export interface Point {
  x: number;
  y: number;
}

export interface SourceRecord {
  sourceId: string;

  caseId: string;
  documentId: string;

  page: number;
  elementId: string | number;
  category: string;

  text: string;
  html?: string;
  markdown?: string;

  polygon?: Point[];
  wordCoordinates?: Point[][];

  confidence?: number;

  semanticNodeId?: string;
}
```

모든 downstream 근거 UI는 SourceRecord를 참조한다.

---

---

# 24. Source ID 규칙

모델이 Source ID를 만들게 하지 않는다.

```text
BAD
Solar → "source_123" 생성

GOOD
Registry → source ID 생성
Solar → 허용된 source ID 중 선택
```

Element ID가 Parse에서 제공되면 그대로 사용.

없으면:

```text
documentId + page + elementIndex
```

기반 deterministic ID를 생성한다.

---

---

# 25. One Evidence Model

같은 source를 다음 모든 경험이 공유한다.

```text
SourceRecord
├─ Initial Guidance citation
├─ Quick Decision evidence
├─ Chat Answer evidence
├─ Viewer highlight
├─ Outline selected row
├─ Semantic View focus
└─ VoiceOver focus target
```

핵심 invariant:

> UI에서 근거를 보여주는 모든 판단은 유효한 `sourceId`를 가져야 한다.

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

---

# 27. Result Card Component

공통 컴포넌트:

```ts
interface ResultCardProps {
  title: string;
  body: React.ReactNode;

  sourceIds?: string[];

  accent?: 'lime' | 'neutral' | 'warning';
  onSourceClick?: (sourceId: string) => void;
}
```

Style 기준:

- dark surface
- stroke 최소화
- 12px radius
- 왼쪽 4px lime accent
- title 13~17px
- secondary copy
- source reference

---

---

# 28. Quick Question

Agent output으로 미리 생성한다.

Quick Button을 누를 때 새로운 LLM 호출을 하지 않는다.

Canonical model:

```ts
export type QuestionInputType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'date'
  | 'organization_select';

export interface QuickQuestion {
  id: string;

  key: string;
  label: string;
  inputType: QuestionInputType;

  required: boolean;
  options?: string[];

  ruleText?: string;

  sourceIds: string[];

  confidence?: number;
}
```

---

---

# 29. Quick Question Parsing

현재 Agent output이 compact text format일 수 있으므로 parser를 둔다.

예:

```text
key=university_location_type
| label=재학 중인 대학교 유형
| type=select
| required=true
| options=서울 소재, 비서울 소재, 원격대학
| rule=...
```

Parser 실패 시 question 자체를 버리지 않고 fallback:

```text
inputType = text
required = false
```

단, 깨진 질문은 UI에서 표시하기 전에 validation한다.

---

---

# 30. Quick Question Dedupe

`primary_notice`와 `requirements_checklist`에서 같은 의미의 질문이 중복될 수 있다.

과정:

```text
Primary Questions
+
Checklist Questions
↓
Normalize Key
↓
Semantic-ish Alias Mapping
↓
Dedupe
```

P0 alias 예:

```ts
const aliases = {
  campus_location_seoul: 'university_location_type',
  school_location: 'university_location_type',

  is_seoul_citizen_or_household_member:
    'seoul_residency_condition'
};
```

우선순위:

```text
primary_notice
> requirements_checklist
```

단 checklist에만 존재하는 추가 질문은 유지.

---

---

# 31. Quick Question UI

`inputType`에 따라 컴포넌트를 동적으로 선택.

```tsx
switch (question.inputType) {
  case 'select':
    return <Select />;
  case 'boolean':
    return <SegmentedControl />;
  case 'number':
    return <NumberInput />;
  case 'date':
    return <DateInput />;
  case 'organization_select':
    return <Combobox />;
  default:
    return <TextInput />;
}
```

`options`가 있으면 hardcode하지 않고 Agent 값을 사용한다.

---

---

# 32. "왜 묻나요?" 기능

추가 AI 호출 없이 `ruleText`를 이용한다.

```text
학교 유형
[비서울 소재 ▼]

왜 묻나요?
이 조건은 학교 소재지와 거주 요건에 따라
신청 가능 여부가 달라지기 때문에 확인합니다.
```

원칙:

- rule 원문을 그대로 길게 보여주지 않는다.
- 기본은 collapse.
- 필요하면 source link 표시.

---

---

# 33. Required / Optional

```text
필수 질문
→ required badge

선택/조건부
→ "모르면 비워도 돼요"
```

미입력 상태는 `false`와 구분한다.

```ts
type UserAnswer =
  | string
  | number
  | boolean
  | null; // unknown/unanswered
```

---

---

# 34. Quick Confirm

사용자가 입력한 정보를 Solar/판정에 쓰기 전에 한 번 확인.

```text
입력한 내용을 확인해주세요.

학교 유형            비서울
현재 학년            1학년
지원구간             3구간
성적                 92
거주 조건            미입력

🛡 이 정보는 지원 조건 확인에 사용됩니다.

☑ 위 정보를 분석에 사용하는 데 동의합니다.

[이 조건으로 확인하기]
```

---

---

# 35. Decision Engine

판정은 Hybrid.

## 35.1 Deterministic

코드로 확실히 평가 가능한 조건:

```text
number comparison
boolean equality
date comparison
exact select equality
reference membership
```

예:

```ts
score >= 90
incomeBracket <= 4
date <= deadline
```

---

## 35.2 Solar

다음만 Solar에 맡긴다.

- 자연어 복합 조건
- 예외/단서가 여러 문서에 흩어짐
- reference lookup과 조건 조합
- 충돌/애매함
- 사용자 질문형 판단

Solar는 반드시 candidate Source ID만 받을 수 있게 한다.

---

---

# 36. Decision 상태

```ts
export type DecisionStatus =
  | 'eligible'
  | 'ineligible'
  | 'needs_more_information'
  | 'conflict';
```

UI copy는 행정적 확정을 피한다.

예:

```text
eligible
→ "현재 입력 기준으로 지원 가능성이 높아요"

ineligible
→ "현재 입력 기준으로 충족하지 않는 조건이 있어요"

needs_more_information
→ "추가 확인이 필요한 조건이 있어요"

conflict
→ "문서 간 안내가 서로 달라 확인이 필요해요"
```

---

---

# 37. 조건별 Breakdown

기존 결과의 `충족 3 / 확인 필요 1`에서 끝내지 않는다.

```text
지원 조건

✓ 학년
  입력: 1학년
  기준: 1학년 학생

✓ 지원구간
  입력: 3구간
  기준: 4구간 이하

✓ 성적
  입력: 92점
  기준: 90점 이상

? 거주 조건
  아직 입력하지 않았어요.
  [입력하기]
```

각 row에 `sourceId`가 있으면 source icon을 붙인다.

---

---

# 38. Missing Information UX

`needs_more_information`은 실패가 아니다.

```text
확인 필요

거주 조건을 아직 확인하지 못했어요.
이 조건은 제출서류와 지원 가능 여부에 영향을 줄 수 있어요.

[거주 조건 입력하기]
```

Deep link:

```text
Decision Row
→ Quick Form
→ 특정 question auto focus
```

---

---

# 39. 제출물 Checklist

기존 Extract 결과를 재사용한다.

```text
준비할 것

□ 자기소개서
  HWP/HWPX

□ 성적증명서
  PDF

□ 소득 증빙
  본인 조건에 맞는 서류 1개

△ 주민등록등본
  해당하는 경우만
```

사용자가 체크한 상태는 local DB에 저장.

Agent를 다시 호출하지 않는다.

---

---

# 40. Application Form "작성 전 확인"

`application_form_extract`가 있으면 Side Panel 또는 Viewer에서 다음 카드 제공.

```text
자기소개서 작성 전 확인

필수 입력
• 진로활동 목표
• 지원 동기
• 활동 계획
...

형식
• 1~2페이지
• 11pt
• 줄간격 160%

주의
⚠ 학교명/로고 노출 금지
⚠ 안내문/예시는 제출 전 삭제
```

이 기능은 role-aware UI의 대표 예시다.

---

---

# 41. Procedure "진행 순서"

```text
신청 순서

1. 로그인
2. 신청 페이지 이동
3. 신청정보 입력
4. 파일 업로드
5. 최종 제출
6. 완료 상태 확인
```

`completion_checks`를 마지막에 별도 강조.

```text
완료 확인
✓ "접수완료" 상태 확인
```

---

---

# 42. Critical Caution

Agent의 caution field를 별도 UX로 노출.

```text
놓치면 안 되는 것

⚠ 마감 이후 접수는 인정되지 않습니다.
⚠ 제출 후 수정이 제한될 수 있습니다.
```

Suggestion Chip:

```text
[주의사항 알려줘]
```

클릭 시 우선 cached caution을 즉시 표시하고, 필요할 때만 Solar로 추가 설명.

---

---

# 43. Deadline Mini Timeline

날짜 정보가 2개 이상 있으면 정렬해서 표시 가능.

```text
일정

8/3 10:00
신청 시작

8/10 14:00
문의 대응 마감

8/10 15:00
신청 마감   중요

9/30
결과 발표
```

P0에서는 최대 4개.

새로운 AI 호출 없음.

---

---

# 44. Next Action Checklist

Initial Guidance `nextActions`를 local checklist로 변환.

```text
지금 해야 할 일

☑ 지원 조건 확인
□ 자기소개서 작성
□ 증빙서류 준비
□ 최종 제출
```

체크 상태는 Case 단위 저장.

---

---

# 45. Chat Suggestion Chip

공통:

```text
[나는 신청할 수 있나요?]
[무엇을 준비해야 하나요?]
[주의사항 알려줘]
```

동작:

### "나는 신청할 수 있나요?"
Quick Form으로 이동.

### "무엇을 준비해야 하나요?"
기존 Extract 결과를 즉시 우선 렌더.
필요 시 Solar로 보완.

### "주의사항 알려줘"
critical/procedure/form cautions 우선 즉시 렌더.

즉, Quick Chip을 누를 때 매번 Solar를 부르지 않는다.

---
