# Source Registry와 Evidence Model

Every Answer Has a Place를 구현하는 핵심 계약이다.

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

# 53. Evidence Validator

Solar 응답 후 반드시 검증.

```ts
for (const id of answer.evidenceSourceIds) {
  assert(sourceRegistry.has(id));
  assert(source.caseId === currentCase.id);
}
```

유효하지 않은 source ID가 있으면:

- 해당 citation 제거
- 핵심 답변이 근거 없이 남으면 사용자에게 답변하지 않음
- `insufficient_evidence` 처리

---

---

# 63. Coordinate System

좌표는 canonical storage에서 normalized 좌표로 유지하는 것이 목표.

```ts
interface Point {
  x: number; // normalized
  y: number;
}
```

화면 변환:

```text
screenX = x * renderedWidth
screenY = y * renderedHeight
```

Renderer가 다른 좌표계를 사용하면 adapter가 변환한다.

```ts
interface CoordinateTransform {
  sourceToViewport(point: Point): {
    x: number;
    y: number;
  };
}
```

---

---

# 64. Evidence Overlay

원문 highlight:

- lime
- 약 40~45% opacity
- 너무 두꺼운 border 없음
- 근거 번호 badge 표시 가능

```text
① [highlight]
② [highlight]
③ [highlight]
```

같은 번호가 오른쪽 summary에 표시된다.

---

---

# 65. Source Hover Preview

Side Panel 또는 Viewer 우측의 source 번호 hover:

```text
공고문.pdf · 2쪽

"학자금 지원구간 4구간 이하인 자"
```

이미 존재하는 SourceRecord를 사용.

새 API 호출 없음.

Click:

```text
open Viewer / navigateToSource(sourceId)
```

---

---

# 68. Summary + Evidence UI

```text
주요 요약
문서의 핵심 내용을 순서대로 정리했어요.

1. 지원 자격
• ... ①
• ... ②
• ... ③

2. 신청 안내
• ... ④
• ... ⑤

3. 제출 서류
• ... ⑥

근거를 눌러 원문의 위치로 이동하세요.
```

번호 badge는 Source ID에 대응.

---

---

# 69. `navigateToSource`

모든 source navigation은 단일 함수로 통일.

```ts
async function navigateToSource(sourceId: string) {
  const source = await sourceRegistry.get(sourceId);

  await viewer.selectDocument(source.documentId);
  await viewer.goToPage(source.page);
  await viewer.focusSource(source);

  outline.select(source.semanticNodeId ?? source.sourceId);
  accessibility.focus(source.semanticNodeId);
}
```

---
