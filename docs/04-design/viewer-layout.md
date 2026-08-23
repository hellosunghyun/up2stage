# Viewer Layout 상세 Spec

224px Outline + Flexible Workspace 구조를 정의한다. Guidance와 Q&A는 Chrome Extension Side Panel을 사용한다.

# 55. Viewer Page Layout

Viewer는 원문 탐색에 집중하는 2-column layout이다.

```text
┌──────────────┬─────────────────────────────────────────────────────┐
│ Outline      │ Document Workspace                                  │
│ 224px        │ flexible                                            │
└──────────────┴─────────────────────────────────────────────────────┘
```

Chrome toolbar 제외 컨텐츠 높이 약 `946px`.

Responsive:

```css
.viewer {
  display: grid;
  grid-template-columns:
    var(--outline-width, 224px)
    minmax(0, 1fr);
}
```

좁은 화면에서는 Outline을 drawer로 접을 수 있게 한다.

---

---

# 56. Viewer Left: Document Outline

Width:

```text
224px
```

Header:

```text
문서 목차
공고문.pdf · 4 / 12
────────────────
```

Rows:

```text
H1  문서 제목
H2  지원 대상
P   지원 자격 요건
L   학년 조건
L   성적 조건
L   지원구간    selected
H2  신청기간
P   ...
```

표식:

```text
H1
H2
H3
P
L
T
F
```

---

---

# 57. Outline 데이터 생성

Parse Element categories 기반으로 구조 tree 생성.

```ts
export interface OutlineNode {
  id: string;
  documentId: string;

  type:
    | 'heading'
    | 'paragraph'
    | 'list'
    | 'table'
    | 'figure';

  level?: number;

  label: string;
  sourceId: string;

  children?: OutlineNode[];
}
```

P0에서는 완벽한 계층 추론보다 순서와 heading level 보존이 우선.

---

---

# 58. Viewer Center: Workspace

Background:

```text
#F7F7FC 계열
```

문서는 중앙 정렬.

Figma mockup에서는 약 532px 폭이지만 실제 구현:

```css
.document-surface {
  max-width: min(720px, calc(100% - 64px));
}
```

Zoom:

```text
Fit Width
100%
125%
150%
```

P0 최소 기능:

- zoom
- scroll
- page 이동
- source scroll
- highlight

---

---

# 59. Renderer Adapter

공통 인터페이스:

```ts
export interface DocumentRendererAdapter {
  supports(document: DocumentRecord): boolean;

  mount(container: HTMLElement): Promise<void>;

  goToPage(page: number): Promise<void>;

  focusSource(source: SourceRecord): Promise<void>;

  setZoom(scale: number): void;

  destroy(): void;
}
```

Viewer Shell은 포맷별 내부 구현을 모른다.

---

---

# 60. PDF Renderer

라이브러리:

```text
pdfjs-dist
```

레이어:

```text
Canvas/Page Layer
Text Layer
Evidence Overlay
Interaction Layer
```

PDF에서는 native text layer를 유지하여 selection/search가 가능한 수준까지 제공.

Evidence highlight는 SourceRecord polygon을 사용.

---

---

# 61. HWP/HWPX Renderer

라이브러리:

```text
@rhwp/core
```

목표:

- 편집 없음
- readonly rendering
- pagination
- 기본 이미지/표/텍스트 표현
- Source element navigation

P0에서 native character-level selection은 필수 아님.

Source navigation은 element/polygon 수준.

렌더 결과와 Upstage coordinate system이 완전히 동일하지 않을 가능성이 있으므로 adapter에 coordinate calibration layer를 둔다.

---

---

# 62. XLSX Renderer

```text
SheetJS CE
+
@tanstack/react-virtual
+
custom readonly grid
```

스프레드시트에서는 page polygon보다 logical cell reference가 자연스럽다.

```ts
interface SpreadsheetSourceLocator {
  sheetName: string;
  row: number;
  column: number;
}
```

P0에서는 Parse source와 cell이 정확히 연결되지 않는 경우 Search 결과 text를 기반으로 row lookup fallback을 둘 수 있다.

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

# 66. Chrome Extension Side Panel과의 경계

Guidance, Quick Check, Search/Solar Q&A는 Chrome Extension Side Panel에 유지한다.

Viewer에는 우측 Guidance 패널을 복제하지 않는다. Side Panel의 Source click이 Viewer를 열고 원문 위치로 이동한다.

---

---

# 67. Viewer Mode

Tabs:

```text
[구조 보기] [원문 보기] [접근성 보기]
```

### 구조 보기
- outline + source-oriented navigation
- role-aware summary

### 원문 보기
- renderer 중심
- highlight

### 접근성 보기
- semantic HTML
- keyboard/screen reader navigation

실제 구현에서는 중앙 Renderer의 display mode만 바뀌고 Extension Side Panel의 대화 context는 별도로 유지한다.

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
