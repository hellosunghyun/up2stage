# Quick Question과 Decision Contract

Extract 질문을 동적 폼과 재현 가능한 판정으로 연결한다.

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
