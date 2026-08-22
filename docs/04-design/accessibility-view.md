# Accessible Semantic View

원문 구조와 AI Guidance를 구분하면서 동일 Source ID로 동기화한다.

# 70. Accessible Semantic View

Raw Parse HTML을 그대로 inject하지 않는다.

```text
Parse Elements
↓
Semantic Normalizer
↓
Semantic Document Tree
↓
React Semantic Renderer
```

Mapping:

```text
heading → h1~h6
paragraph → p
ordered list → ol
unordered list → ul
table → table
table header → th
figure → figure
caption → figcaption
checkbox → input[type=checkbox], readonly 표현
```

---

---

# 71. Semantic Node

```ts
interface SemanticNode {
  id: string;
  sourceId: string;

  type:
    | 'heading'
    | 'paragraph'
    | 'ordered-list'
    | 'unordered-list'
    | 'table'
    | 'figure'
    | 'caption';

  level?: number;
  text?: string;

  children?: SemanticNode[];
}
```

---

---

# 72. Accessibility 원칙

- native HTML 우선
- ARIA는 필요한 경우만
- heading 순서 유지
- table header scope
- visible focus
- keyboard navigation
- Viewer highlight와 semantic focus 동기화
- AI 해석과 원문 semantic content를 시각적으로 구분

---

---

# 73. Keyboard Navigation

최소:

```text
Tab
Shift+Tab
Enter
Esc
```

Document navigation helper:

```text
H → 다음 heading
Shift+H → 이전 heading
```

단 브라우저/스크린리더 shortcut과 충돌하지 않는지 확인 후 사용.

충돌이 있으면 explicit keyboard UI만 제공.

---

---

# 91. 접근성 시각 표현

원문과 AI Guidance가 혼동되지 않게 한다.

```text
Original Source
→ 중립 배경

Evidence Highlight
→ Lime translucent

AI Guidance
→ Dark panel / 명확한 label

Conflict
→ Warning state
```

AI가 생성한 문장을 원문처럼 표시하지 않는다.

---
