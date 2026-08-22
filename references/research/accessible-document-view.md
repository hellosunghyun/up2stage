# Unfold Accessible Document View 심층 리서치

Unfold의 방향은 접근성 관점에서 타당합니다. 핵심은 **"원본 문서를 장애인용 별도 버전으로 변환한다"가 아니라, "문서의 논리 구조를 복원한 하나의 Semantic Document를 만들고 브라우저, 키보드, 스크린 리더가 같은 구조를 각기 다른 방식으로 탐색하게 한다"**로 정의하는 것이 좋습니다. WCAG 2.2의 핵심 요구 중 하나도 시각적으로 표현된 정보, 구조, 관계와 의미 있는 읽기 순서를 프로그램적으로 결정할 수 있도록 하는 것입니다. citeturn0search7turn3search3turn3search0

이 설계에서는 **AI가 HTML을 직접 생성하는 것이 아니라 Semantic Document Model을 먼저 생성하고, 그 모델을 결정론적으로 HTML로 컴파일하는 구조**를 권장합니다. AI는 "이 블록이 무엇인가"와 "무엇과 연결되는가"를 추론하고, HTML renderer는 `<h2>`, `<table>`, `scope`, `headers`, `alt`, `role="status"` 같은 규칙을 표준에 따라 생성하는 방식입니다. 이렇게 해야 모델의 출력 변동성과 접근성 규칙을 분리할 수 있습니다.

## 문서 모델과 Semantic HTML 원칙

**A. Accessible Document Model**

Unfold 내부 모델은 최소한 다음 두 층을 분리하는 것이 좋습니다.

```text
Source Geometry Layer
  page
  bbox
  polygon
  visual_style
  font_size
  font_weight
  coordinates
  source_object_id

Semantic Document Layer
  type
  text
  parent
  children
  reading_order
  heading_level
  relationships
  accessible_name
  description
  source_reference
  confidence
```

추천 노드 모델은 다음과 같습니다.

```ts
type DocumentNode = {
  id: string;
  type:
    | "document"
    | "heading"
    | "paragraph"
    | "list"
    | "list_item"
    | "table"
    | "table_row"
    | "table_cell"
    | "figure"
    | "image"
    | "chart"
    | "diagram"
    | "caption"
    | "footnote"
    | "checkbox"
    | "form_field"
    | "link"
    | "page_break";

  text?: string;

  parentId?: string;
  children?: string[];

  semanticOrder: number;

  page?: number;
  bbox?: [number, number, number, number];

  headingLevel?: number;

  relationships?: {
    captionFor?: string;
    describedBy?: string[];
    tableHeaders?: string[];
    footnoteTarget?: string;
    sourceAnchor?: string;
  };

  confidence?: {
    type?: number;
    hierarchy?: number;
    readingOrder?: number;
    relationship?: number;
    text?: number;
  };

  provenance?: {
    sourceElementId?: string;
    extractor?: string;
    aiGenerated?: boolean;
  };
};
```

중요한 설계 원칙은 **`bbox`가 DOM 순서를 결정하는 직접적인 표현이 되어서는 안 된다는 것**입니다. WCAG 2.2 SC 1.3.2는 순서가 의미에 영향을 주는 경우 올바른 읽기 순서가 프로그램적으로 결정될 것을 요구하고, W3C는 시각적 순서와 DOM/source order의 불일치가 보조기술 사용자를 혼란스럽게 할 수 있다고 설명합니다. citeturn3search3turn3search9turn3search2

따라서 Unfold에서 가장 중요한 불변식은 다음과 같습니다.

| Accessible Document 불변식 | 의미 |
|---|---|
| **Semantic order = DOM order** | 스크린 리더가 읽는 순서 자체가 의미 있는 순서여야 함 |
| **Visual geometry ≠ semantics** | 좌표와 글꼴은 의미 추론 신호일 뿐 의미 자체가 아님 |
| **Relationships are explicit** | heading parent, table header, figure caption, footnote ref 등을 ID 기반 관계로 저장 |
| **Source provenance survives conversion** | 모든 의미 노드가 원본 페이지/좌표로 역추적 가능 |
| **Uncertain semantics remain uncertain** | AI가 확신하지 못한 header, chart value 등을 임의 확정하지 않음 |
| **HTML generation is deterministic** | 같은 semantic model에서 같은 HTML 구조가 생성됨 |

### Semantic HTML과 ARIA의 경계

WAI-ARIA 1.2는 ARIA가 **native language semantics의 대체재가 아니라 보완재**이며, HTML에 동등한 기능이 있으면 HTML 기능을 사용해야 한다고 명시합니다. APG 역시 **"No ARIA is better than Bad ARIA"** 원칙을 강조합니다. citeturn21search2turn21search3turn21search11

예를 들어 다음 구현은 피해야 합니다.

```html
<div role="heading" aria-level="2">분석 결과</div>
<div role="link" tabindex="0">원문 보기</div>
<div role="checkbox" aria-checked="true">동의</div>
```

동일한 의미가 HTML에 존재하므로 다음이 우선입니다.

```html
<h2>분석 결과</h2>
<a href="#source-42">원문 보기</a>

<label>
  <input type="checkbox" checked>
  동의
</label>
```

Native HTML은 role뿐 아니라 기본 키보드 조작, 포커스, 상태 노출, 브라우저 접근성 API 매핑을 함께 제공합니다. ARIA role만 붙인 요소에는 이런 동작이 자동으로 생기지 않습니다. W3C APG도 `role="link"`가 실제 `<a href>`의 브라우저 동작을 자동으로 부여하지 않는다고 경고합니다. citeturn21search20turn21search2

Unfold에서 ARIA가 실제로 필요한 대표 사례는 세 종류입니다.

**첫째, HTML 자체에 없는 출판 문서 의미**입니다. footnote, footnote reference, page break처럼 HTML에 직접 대응하는 요소가 없는 경우 DPub-ARIA 1.1의 `doc-footnote`, `doc-noteref`, `doc-pagebreak`가 정당합니다. DPub-ARIA 1.1은 2025년 W3C Recommendation이 된 디지털 출판용 ARIA 모듈입니다. citeturn24search0

**둘째, 동적 상태 전달**입니다. 분석 완료나 오류처럼 DOM 변경 사실 자체를 알려야 할 때 `role="status"`, `role="alert"`, `aria-live`, `aria-busy`를 사용합니다. WCAG 2.2 SC 4.1.3은 상태 메시지를 포커스를 이동시키지 않고 보조기술이 감지할 수 있어야 한다고 요구합니다. citeturn14search5turn24search1

**셋째, native HTML만으로 표현할 수 없는 추가 관계**입니다. 예를 들어 복잡한 이미지의 별도 설명을 `aria-describedby`로 연결하거나, 필요한 경우 interactive custom widget의 상태를 보완합니다. 단, 정적 문서 표를 `role="grid"`로 만드는 것은 잘못된 방향입니다. W3C는 `table`이 정적 표 구조이고 `grid`는 interactive widget이라고 구분하며, HTML `<table>`을 우선하도록 권고합니다. citeturn21search18

### Heading hierarchy

AI가 "heading 여부"만 알고 정확한 수준을 모른다면 **글꼴 크기 순으로 h1, h2, h3를 단순 할당하면 안 됩니다**. W3C는 heading rank가 콘텐츠 조직을 나타내며, 하위 방향으로 heading level을 건너뛰는 것이 혼란을 일으킬 수 있어 피하라고 안내합니다. 반대로 하위 섹션을 닫으면서 `h4 → h2`처럼 상위 수준으로 돌아가는 것은 자연스럽습니다. citeturn1search0turn0search0

Unfold에서는 다음과 같이 hierarchy inference를 하는 것이 좋습니다.

```text
heading candidate detection
        ↓
style cluster detection
        ↓
numbering / lexical structure detection
        ↓
reading-order context
        ↓
parent-child hierarchy inference
        ↓
global consistency optimization
        ↓
confidence + exception handling
```

각 heading 후보에 다음 feature를 결합합니다.

| 신호 | 예시 | 신뢰도 |
|---|---|---:|
| 문서 제목 | 첫 페이지 상단, 가장 강한 제목 | 높음 |
| 장/절 numbering | `1`, `1.1`, `제2장`, `가.` | 높음 |
| 반복된 visual style | 동일 font size, weight, spacing | 중간~높음 |
| 상하 whitespace | 본문보다 큰 section gap | 중간 |
| indent/alignment | 동일 계층의 반복 정렬 | 중간 |
| 언어적 패턴 | "개요", "방법", "결론" 등 | 중간 |
| font size 단독 | 큰 글씨 | 낮음 |
| bold 단독 | 강조 문장 | 낮음 |

전역 추론은 다음 제약을 두면 안정적입니다.

```text
title               -> h1

section after h1    -> normally h2
subsection of h2    -> normally h3

h2 -> h4            -> penalty
h4 -> h2            -> allowed
h2 -> h3 -> h4      -> preferred

number 3.2
  must not become a parent of number 3

same visual style
  prefers same heading level
```

즉, 개념적으로는 다음 목적함수를 푸는 셈입니다.

```text
maximize
  local_style_consistency
+ numbering_consistency
+ parent_child_consistency
+ document_outline_consistency

minimize
  skipped_descending_levels
+ hierarchy_inversions
+ isolated_heading_styles
```

잘못된 heading level은 단순한 시각적 오류가 아닙니다. VoiceOver rotor의 Headings 목록은 heading들을 구조적으로 노출하며, 사용자가 heading level 숫자를 입력해 특정 수준만 필터링할 수도 있습니다. 따라서 실제 h2가 h4로 생성되면 사용자가 "level 2 섹션"만 탐색할 때 해당 섹션이 사실상 사라집니다. citeturn25view3

여기서 중요한 WCAG 해석은 **`h2 → h4`가 있다는 사실만으로 무조건 WCAG 실패라고 단정해서는 안 된다**는 것입니다. 그러나 화면상 계층 관계와 프로그램적 heading 구조가 서로 다르다면 SC 1.3.1의 정보와 관계 요구를 위반할 수 있고, W3C heading guidance에도 어긋납니다. citeturn0search7turn1search0

AI confidence를 제품 모델에 남기는 것도 좋습니다. 예를 들어 MVP 내부 기준으로 `hierarchy confidence < 0.7`인 섹션을 QA 대상으로 플래그할 수 있습니다. 이 0.7이라는 값 자체는 WCAG 기준이 아니라 **Unfold가 정해야 하는 품질 게이트**입니다.

### Reading Order와 다단 문서

다단 PDF에서 가장 위험한 변환은 다음입니다.

```text
DOM:
왼쪽 1
오른쪽 1
왼쪽 2
오른쪽 2

CSS:
시각적으로는 두 개의 정상적인 세로 열
```

스크린 리더는 CSS가 보이는 모양보다 DOM과 accessibility tree의 순서를 따라가므로 이 경우 문장이 열 사이를 오가며 읽힐 수 있습니다. WCAG Meaningful Sequence와 W3C C27 기법은 source order와 의미 있는 presentation order를 일치시키는 접근을 권장합니다. citeturn3search0turn3search2

추천 다단 처리 알고리즘은 다음입니다.

```text
page
 ↓
detect full-width spanning blocks
 ↓
segment region between spanning blocks
 ↓
detect columns inside region
 ↓
order blocks within each column
 ↓
append next logical column
 ↓
merge paragraphs split across page boundaries
 ↓
insert optional page marker
```

예를 들어 다음 레이아웃은:

```text
[              제목               ]

[column A]             [column B]
A1                     B1
A2                     B2
A3                     B3

[          전체 폭 그림          ]
```

DOM은 다음 순서가 되어야 합니다.

```html
<h2>제목</h2>

<p>A1...</p>
<p>A2...</p>
<p>A3...</p>

<p>B1...</p>
<p>B2...</p>
<p>B3...</p>

<figure>...</figure>
```

CSS Grid나 absolute positioning은 **이 논리적 DOM을 시각적으로 표현하는 데만** 사용해야 합니다. `order`, positive `tabindex` 또는 위치 CSS로 잘못된 DOM을 사후 교정하는 접근은 피하는 편이 안전합니다. 키보드 초점 순서 역시 의미와 조작성을 보존해야 합니다. citeturn24search6turn3search2

페이지 중간에서 하나의 문단이 끊긴 PDF라면 웹에서는 원칙적으로 하나의 `<p>`로 합치는 편이 좋습니다. 페이지 번호 참조가 중요한 문서라면 DPub-ARIA의 `doc-pagebreak` marker를 해당 위치에 보존할 수 있습니다. `doc-pagebreak`는 새 페이지가 시작되는 위치와 사용자에게 의미 있는 페이지 이름을 표현하도록 설계됐습니다. citeturn24search0

## AI element에서 Semantic HTML로의 매핑

**B. AI element → Semantic HTML Mapping Table**

| AI element | 기본 Semantic HTML | ARIA / 추가 속성 | Unfold 처리 원칙 |
|---|---|---|---|
| **document title** | `<title>` + visible `<h1>` | 필요 없음 | 브라우저 문서 제목과 실제 문서 제목을 모두 제공. 페이지 제목은 사용자 orientation에 중요합니다. citeturn0search22 |
| **heading level** | `<h1>`~`<h6>` | 매우 예외적으로 `role="heading" aria-level="…"` | native heading을 우선. AI가 level을 추론한 뒤 실제 element로 렌더링합니다. citeturn21search2turn1search0 |
| **paragraph** | `<p>` | 없음 | 좌표 기반 `<div>` 조각이 아니라 실제 단락 단위로 합칩니다. HTML은 문서의 semantic-level markup을 제공하도록 정의됩니다. citeturn21search8turn21search24 |
| **ordered list** | `<ol><li>` | 없음 | 숫자/단계의 순서가 의미일 때 `<ol>`. |
| **unordered list** | `<ul><li>` | 없음 | bullet glyph를 텍스트로 읽히게 하지 않고 list structure로 복원합니다. |
| **table** | `<table>` + `<tr>` + `<th>/<td>` | 필요 시 `aria-describedby` | 정적 표는 native `<table>`. `role="grid"` 금지. citeturn21search0turn21search18 |
| **table header** | `<th>` | `scope="col"`, `"row"`, `"colgroup"`, `"rowgroup"` | 단순 관계는 `scope`, 복잡 관계는 `id/headers`. citeturn21search0turn1search7 |
| **merged cell** | `<td colspan rowspan>` 또는 `<th colspan rowspan>` | 복잡 header이면 `id/headers` | merged geometry를 HTML grid span으로 복원하되 cell overlap이 없어야 합니다. citeturn21search0 |
| **image** | `<img alt="…">` | 필요 시 `aria-describedby` | captioned/self-contained image는 `<figure>`와 결합. citeturn11search7turn21search15 |
| **chart** | `<figure><img …><figcaption>` + data/description | `aria-describedby` 가능 | short alt + 상세 설명. 수치 데이터가 신뢰 가능하면 HTML data table 병행. citeturn11search13turn11search14 |
| **diagram** | `<figure>` + image + description | `aria-describedby` 가능 | 관계, 흐름, 방향까지 텍스트 equivalent에 포함해야 합니다. citeturn0search4turn11search13 |
| **footnote** | 본문 `<sup><a …>` + note `<aside>` | `role="doc-noteref"`, `role="doc-footnote"`, 필요 시 `doc-backlink` | HTML에 native footnote semantics가 없어 DPub-ARIA가 적절합니다. citeturn24search0 |
| **caption** | table은 `<caption>`, figure는 `<figcaption>` | 필요 없음 | generic `<div class=caption>`보다 해당 객체의 native caption을 사용합니다. citeturn1search15turn21search15 |
| **checkbox** | `<input type="checkbox">` + `<label>` | native로 충분 | 실제 입력 가능한 control인 경우. ARIA checkbox를 직접 구현하지 않습니다. citeturn21search2 |
| **form field** | `<input>`, `<textarea>`, `<select>`, `<fieldset>`, `<legend>`, `<label>` | `aria-describedby`, `aria-invalid`, 필요 시 `aria-errormessage` | field type과 label 관계를 native HTML로 표현합니다. |
| **hyperlink** | `<a href="…">` | 거의 불필요 | 링크 목적이 text 또는 programmatic context에서 이해되어야 합니다. citeturn24search8turn21search20 |
| **page boundary** | HTML native element 없음 | `role="doc-pagebreak"` + accessible page name | 페이지 참조가 문서 의미에 필요할 때만 노출. 단순 종이 pagination은 UI metadata로 처리 가능. citeturn24search0 |
| **reading order** | **DOM order 자체** | ARIA로 해결하지 않음 | AI의 reading-order 결과를 DOM serialization에 사용합니다. citeturn3search3turn3search2 |

체크박스에는 한 가지 예외가 중요합니다. PDF에 인쇄된 `☒ 동의함`이 단지 완료된 문서 상태를 보여줄 뿐 사용자가 웹에서 수정할 수 없는 경우라면 **가짜 interactive checkbox를 만들지 않는 것이 좋습니다**. `<input>`은 "조작 가능한 form control"이라는 의미까지 추가하기 때문입니다. 이런 경우에는 "선택됨: 동의함"과 같은 정적 의미로 표현하고 시각적 체크 glyph는 중복 노출되지 않게 하는 편이 정확합니다. 이는 "보이는 모양"이 아니라 실제 의미와 기능을 HTML에 반영해야 한다는 native semantics 원칙의 적용입니다. citeturn21search2turn21search3

### HTML document skeleton

Unfold의 문서 뷰는 대략 다음 형태가 적합합니다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>2026 사업보고서 | Unfold</title>
</head>

<body>
  <header>
    <!-- Unfold document controls -->
  </header>

  <nav aria-label="문서 목차">
    ...
  </nav>

  <main>
    <article aria-labelledby="document-title">
      <h1 id="document-title">2026 사업보고서</h1>

      <section aria-labelledby="section-1">
        <h2 id="section-1">사업 개요</h2>
        ...
      </section>
    </article>
  </main>
</body>
</html>
```

`<main>`, `<nav>`, `<article>`, heading 같은 native landmarks와 sectioning semantics는 VoiceOver의 구조 탐색에 도움을 줍니다. 단, 모든 시각적 박스를 `section`이나 landmark로 바꾸는 것은 오히려 rotor를 시끄럽게 만들 수 있으므로 실제 문서 조직 단위에만 사용하는 것이 좋습니다. HTML Living Standard는 `article`, `aside`, `nav`, `section`을 sectioning content로 정의합니다. citeturn21search14turn21search19

## 표와 복합 시각정보의 접근성

**C. Table Accessibility 상세 규칙**

표에서 가장 중요한 것은 **"화면상 셀이 정렬되어 있다"가 아니라 "각 data cell과 header cell의 관계가 프로그램적으로 계산 가능하다"**는 것입니다. W3C Tables Tutorial과 HTML Living Standard는 `<th>`, `scope`, `headers`, `id`, `rowspan`, `colspan`을 이러한 관계를 표현하는 핵심 메커니즘으로 정의합니다. citeturn1search5turn21search0

### 단순 표

```html
<table>
  <caption>2026년 분기별 매출</caption>
  <thead>
    <tr>
      <th scope="col">분기</th>
      <th scope="col">매출</th>
      <th scope="col">증감률</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1분기</th>
      <td>120억 원</td>
      <td>8%</td>
    </tr>
  </tbody>
</table>
```

여기서:

`<caption>`은 표가 **무엇에 관한 표인지** 식별합니다. W3C는 caption이 사용자가 표를 찾고, 식별하고, table navigation을 시작하는 데 도움을 준다고 설명합니다. citeturn1search15

`<th scope="col">`은 column header이고, `<th scope="row">`는 row header입니다. citeturn1search7turn21search0

`thead`, `tbody`, `tfoot`은 시각 스타일용 div가 아니라 표의 논리적 그룹을 나타냅니다. 특히 `rowgroup`, `colgroup` scope를 사용할 때 이러한 grouping이 중요합니다. citeturn1search3turn21search0

### Multi-level header

예를 들어:

| 지역 | 2025 | 2025 | 2026 | 2026 |
|---|---:|---:|---:|---:|
| | 매출 | 이익 | 매출 | 이익 |

같은 표는 상위 header가 여러 열에 걸쳐 있습니다.

```html
<table>
  <caption>지역별 연간 실적</caption>

  <thead>
    <tr>
      <th rowspan="2" scope="col">지역</th>
      <th colspan="2" scope="colgroup">2025</th>
      <th colspan="2" scope="colgroup">2026</th>
    </tr>

    <tr>
      <th scope="col">매출</th>
      <th scope="col">이익</th>
      <th scope="col">매출</th>
      <th scope="col">이익</th>
    </tr>
  </thead>
  ...
</table>
```

HTML 표 모델은 `scope="rowgroup"`과 `scope="colgroup"`을 명시적으로 지원합니다. citeturn21search0turn1search3

### 복잡하거나 irregular한 표

header 관계가 단순한 행/열 방향으로 계산되지 않는 경우에는 `headers/id`가 더 명확합니다. W3C의 multi-level table guidance는 각 `<th>`에 고유 ID를 지정하고 각 `<td>`의 `headers`에 해당 cell과 관련된 모든 header ID를 지정하는 방법을 설명합니다. citeturn1search1

```html
<th id="y2026">2026</th>
<th id="sales">매출</th>
<th id="seoul">서울</th>

<td headers="seoul y2026 sales">
  120억 원
</td>
```

이 구조를 Unfold 관점에서 보면 단순한 grid가 아니라 다음과 같은 **header association graph**입니다.

```text
                  2026
                   │
                 매출
                   │
서울 ─────────── 120억
```

merged cell 자체는 `rowspan`과 `colspan`으로 정확히 표현할 수 있지만, merged **header**의 의미 범위까지 자동으로 결정되지는 않습니다. 따라서 geometry 복원과 header association 복원을 별도 단계로 가져가야 합니다. HTML은 spanning cell과 `headers` 관계를 각각 독립된 표 모델의 일부로 정의합니다. citeturn21search0

### AI가 visual table만 반환할 때의 복원 알고리즘

추천 pipeline은 다음입니다.

```text
cell polygons
    ↓
row / column boundary clustering
    ↓
logical grid construction
    ↓
rowspan / colspan reconstruction
    ↓
header candidate classification
    ↓
header hierarchy graph
    ↓
data-to-header association
    ↓
semantic HTML generation
    ↓
structural validation
```

**Grid construction**

각 cell polygon의 좌우/상하 boundary를 tolerance clustering하여 logical row와 column을 만듭니다.

```text
cell bbox:
(x1, y1, x2, y2)

cluster x1/x2 -> column boundaries
cluster y1/y2 -> row boundaries
```

한 cell이 여러 logical slot을 덮으면:

```text
column span = c_end - c_start + 1
row span    = r_end - r_start + 1
```

로 `colspan`과 `rowspan`을 생성합니다. HTML 표 모델은 spanning cell이 다른 cell과 겹치지 않아야 합니다. citeturn21search0

**Header inference**

다음 특징을 조합합니다.

```text
position at top or left
+ visual emphasis
+ background / borders
+ semantic text type
+ merged-cell hierarchy
+ neighboring value data types
+ repeated structure
+ empty corner cell patterns
```

예를 들어:

```text
        2025             2026
     매출   비용       매출   비용
서울  100    30        120    40
```

"2025", "2026"은 top-level column-group header, "매출", "비용"은 leaf column header, "서울"은 row header일 가능성이 높습니다.

하지만 **bold 여부 하나만으로 `<th>`를 생성해서는 안 됩니다**. W3C가 요구하는 것은 시각적 스타일이 아니라 구조적 관계가 programmatically determinable한 것이기 때문입니다. citeturn0search7turn1search13

**Association graph**

Unfold 내부적으로 각 data cell이 다음을 가지게 만들면 좋습니다.

```json
{
  "cell": "r3c2",
  "headers": [
    "row:서울",
    "column-group:2026",
    "column:매출"
  ]
}
```

HTML renderer가 단순한 경우 `scope`로 최적화하고, 복잡한 경우 명시적 `id/headers`로 컴파일하는 방식입니다.

**품질 게이트**

MVP에서 다음 invariant는 자동 검사할 수 있습니다.

```text
every data cell belongs to logical grid
no overlapping cell spans

every required data cell has:
  >= 1 column header

if table has row labels:
  >= 1 row header

every headers token resolves to:
  existing <th id>

no duplicated th id

caption exists for meaningful data table
```

AI가 header 관계를 충분히 확신하지 못하면 **그럴듯한 header를 만들어 내는 것보다 보수적으로 실패하는 것이 낫습니다**. 복잡한 표를 여러 단순 표로 분해하는 것도 W3C가 제시하는 유효한 접근입니다. citeturn1search1turn1search13

Unfold의 내부 정책 예시로는 다음과 같이 둘 수 있습니다.

```text
association confidence >= 0.85
  → semantic table

0.60 ~ 0.85
  → semantic table + "구조 자동 추정" flag

< 0.60
  → linearized fallback + original image/table view
```

이 임계값은 표준이 아니라 제품 품질 정책입니다.

### VoiceOver 관점에서 좋은 표의 결과

macOS VoiceOver는 행/열 단위 table navigation을 제공하며 현재 cell의 row header를 `VO-R`, column header를 `VO-C`로 들을 수 있습니다. 따라서 Unfold가 `<td>`와 `<th>` 연결을 잘못 만들면 VoiceOver가 **잘못된 데이터 자체보다 잘못된 문맥을 읽게 됩니다**. citeturn25view2

Apple의 현재 문서상 주요 명령은 다음과 같습니다. `VO`는 기본적으로 Control+Option 또는 Caps Lock입니다. citeturn25view2

| 동작 | VoiceOver |
|---|---|
| 현재 row header | `VO-R` |
| 현재 위치부터 row 끝까지 | `VO-R-R` |
| 현재 column header | `VO-C` |
| 현재 위치부터 column 아래쪽 읽기 | `VO-C-C` |
| column 상하 이동 | `↑` / `↓` |

따라서 표 QA에서 **HTML source만 확인해서는 부족하며 실제 VoiceOver가 기대한 header를 읽는지 확인해야 합니다**. Google Chrome DevTools 문서 역시 markup 자동 검사로 발견할 수 없는 keyboard/screen-reader navigation 문제는 수동 테스트가 필요하다고 설명합니다. citeturn17search17

**D. Image / Chart Accessibility**

WCAG 2.2 SC 1.1.1은 의미 있는 non-text content에 동등한 목적을 제공하는 text alternative를 요구합니다. 간단한 이미지와 복잡한 차트는 필요한 설명 깊이가 다릅니다. citeturn0search4turn11search13

### 일반 informative image

```html
<figure>
  <img
    src="architecture.png"
    alt="클라이언트, API 서버, 데이터베이스로 구성된 시스템 구조"
  >
  <figcaption>그림 3. 시스템 아키텍처</figcaption>
</figure>
```

`alt`는 이미지의 **목적과 핵심 정보**, `figcaption`은 그림의 **제목이나 caption**으로 생각하면 좋습니다. `<figcaption>`은 `<figure>`의 caption을 의미하는 native HTML입니다. citeturn11search7turn21search15

### Decorative image

순수 장식이면:

```html
<img src="ornament.svg" alt="">
```

가 적합합니다. W3C는 의미나 기능이 없는 decorative image에는 empty alt를 사용하도록 안내합니다. citeturn11search10turn11search1

단순히 `alt`를 제거하는 것보다는 `alt=""`를 명시하는 것이 안전합니다. 의미 있는지 장식인지 판단하는 것은 이미지 파일 자체가 아니라 **주변 콘텐츠에서 수행하는 역할**을 기준으로 해야 합니다. citeturn11search10

### Chart와 diagram

복잡한 chart는 한 문장의 `alt`만으로 모든 정보를 전달하기 어렵습니다. W3C는 짧은 text alternative와 함께 별도의 long description을 제공하는 방식을 설명합니다. citeturn0search4turn11search14

예:

```html
<figure>
  <img
    src="revenue-chart.png"
    alt="2023년부터 2026년까지 매출이 지속적으로 증가하는 선형 차트"
    aria-describedby="chart-desc-1"
  >

  <figcaption>그림 4. 연간 매출 추이</figcaption>

  <div id="chart-desc-1">
    <p>
      매출은 2023년 70억 원에서 2026년 120억 원으로 증가했다.
      가장 큰 연간 증가폭은 2025년에서 2026년 사이이다.
    </p>
  </div>
</figure>
```

가능하면 chart underlying data도 제공합니다.

```html
<table>
  <caption>그림 4의 데이터</caption>
  <thead>
    <tr>
      <th scope="col">연도</th>
      <th scope="col">매출</th>
    </tr>
  </thead>
  <tbody>
    ...
  </tbody>
</table>
```

특히 정확한 수치가 중요한 chart에서는 **AI가 픽셀을 보고 추정한 숫자로 data table을 만드는 것보다 OCR/문서 extraction으로 실제 숫자를 확보했을 때만 생성하는 것이 안전합니다**. WCAG가 요구하는 것은 설명이 "존재하는 것"이 아니라 이미지가 제공하는 정보를 동등하게 전달하는 것입니다. citeturn0search4turn11search8

HTML `longdesc` attribute를 Unfold의 핵심 구현으로 선택하는 것은 권하지 않습니다. W3C WCAG technique에서 `longdesc` 기반 기법은 obsolete로 표시되어 있으며, 현재는 인접한 visible description, 연결된 description, data table 같은 방식을 택하는 것이 좋습니다. citeturn11search2turn11search14

### AI-generated description과 WCAG claim

중요한 구분이 있습니다.

```text
alt attribute exists
          ≠
good text alternative
          ≠
WCAG conformance
```

AI가 `alt`를 생성했다고 해서 SC 1.1.1이 자동으로 충족되는 것은 아닙니다. 생성된 설명이 원본 이미지의 목적과 정보를 실제로 동등하게 전달해야 합니다. 잘못된 객체, 수치, 관계를 hallucination하면 `alt`가 없는 문제를 **거짓 정보가 있는 문제**로 바꿀 수 있습니다. W3C의 text-alternative guidance에서도 alternative가 실제 정보를 정확하게 제공하는지가 핵심입니다. citeturn11search8turn0search4

따라서 Unfold의 생성 규칙은 가급적 **추론보다 extraction 우선**이어야 합니다.

```text
visible labels
  ↓
OCR / Document AI extraction

axes / units / legends
  ↓
structured extraction

values
  ↓
only if confidently recoverable

relationship / trend
  ↓
AI summarization

unsupported inference
  ↓
omit / express uncertainty
```

복잡한 이미지 설명에 대해서는 다음 provenance를 저장하는 것을 권장합니다.

```json
{
  "descriptionType": "ai-generated",
  "confidence": 0.82,
  "reviewStatus": "unreviewed",
  "evidence": [
    "chart-label-12",
    "ocr-region-7"
  ]
}
```

**WCAG에는 "이 대체 텍스트가 AI 생성임을 사용자에게 표시하라"는 별도의 성공 기준은 없습니다.** 이는 WCAG의 요구가 생성 주체가 아니라 결과 콘텐츠와 사용자 경험을 대상으로 하기 때문이라는 해석입니다. 다만 hallucination 가능성이 있는 Unfold에서는 표준 준수와 별개로 transparency 차원에서 **"AI가 생성한 이미지 설명"**, **"자동 추출된 데이터"**를 상세 설명 UI에 표시하는 것이 좋은 제품 설계입니다. 이 부분은 WCAG 의무가 아니라 Unfold의 신뢰성 정책으로 보는 것이 정확합니다. citeturn0search4turn17search3

`alt` 자체에 매번 `"AI가 생성한 설명: ..."`을 붙이는 것은 권하지 않습니다. 사용자가 모든 이미지를 탐색할 때 불필요하게 반복됩니다. 대신 figure 단위에서 provenance를 확인할 수 있게 하는 편이 낫습니다.

## VoiceOver와 Agent Interaction

**E. VoiceOver 동작 및 테스트 시나리오**

macOS VoiceOver는 웹에서 rotor를 사용해 headings, links, form controls, tables, landmarks 등을 빠르게 탐색할 수 있습니다. Apple의 기본 trackpad web rotor 항목에도 Links, Headings, Form Controls, Tables, Landmarks, Frames가 포함됩니다. citeturn23search0

VoiceOver의 `VO` modifier는 기본적으로 Control+Option 또는 Caps Lock을 사용할 수 있습니다. rotor 메뉴는 `VO-U`로 열고, 좌우 화살표로 Headings, Links 등의 목록을 선택하고, 위아래 화살표로 항목을 찾은 뒤 Return 또는 Space로 이동합니다. citeturn23search1turn25view3

또 다른 방식으로:

```text
VO-Command-Left/Right
  → navigation category 선택

VO-Command-Up/Down
  → 해당 category의 이전/다음 항목
```

을 사용할 수 있습니다. citeturn25view3

### Heading 이동

테스트:

```text
VO-U
→ Headings
→ ↑ / ↓
→ 원하는 제목
→ Return
```

특히 Heading rotor에서는 숫자 `3` 등을 입력해 특정 heading level만 필터링할 수 있습니다. 따라서 Unfold의 heading hierarchy가 잘못 생성되면 실제 탐색 기능이 직접 손상됩니다. citeturn25view3

검증해야 할 결과:

```text
문서 제목       heading level 1
사업 개요       heading level 2
시장 현황       heading level 3
경쟁사 분석     heading level 3
결론            heading level 2
```

### Link 이동

Rotor의 Links 목록에서 문서 내부 링크와 원본 hyperlink가 의미 있는 이름으로 나타나야 합니다. WCAG 2.2 SC 2.4.4는 link text 또는 programmatically determined context에서 링크의 목적을 판단할 수 있어야 한다고 요구합니다. citeturn24search8

따라서:

```text
"여기"
"클릭"
"보기"
```

보다:

```text
"원본 보고서 12페이지 보기"
"그림 4 데이터 보기"
"각주 7로 이동"
```

가 좋습니다.

### Table 이동

Rotor의 Tables에서 표를 선택한 다음 실제 cell을 탐색하여 row/column header가 함께 들리는지 확인합니다. Apple VoiceOver는 `VO-R`, `VO-C`로 현재 행, 열의 header를 읽을 수 있습니다. citeturn25view2

**최소 표 시험 케이스는 세 종류**가 필요합니다.

```text
simple:
  1 header row

two-axis:
  column + row headers

complex:
  multi-level headers + colspan/rowspan
```

### Landmark 이동

VoiceOver web rotor 기본 구성에는 Landmarks가 포함될 수 있으므로 Unfold의 `<main>`, `<nav>` 등 주요 영역이 과도하지 않으면서 명확하게 구분되는지 확인합니다. citeturn23search0

예상 landmark:

```text
Navigation: 문서 목차
Main
```

Side Panel까지 동일 문서 DOM에 포함된다면:

```text
Complementary: Unfold Agent
```

같은 구성을 검토할 수 있지만, 실제 Chrome Side Panel은 별도 document context일 수 있으므로 두 context 각각의 landmark 구조를 테스트하는 편이 좋습니다.

### Form control

Rotor의 Form Controls에서:

```text
"동의, checkbox, checked"
"이름, text field"
```

처럼 label, role, state가 유효한지 확인합니다. Native HTML을 사용하면 이러한 접근성 정보가 브라우저 accessibility API로 기본 매핑됩니다. citeturn21search2turn23search0

### Image

Apple의 Item Chooser는 `VO-I`로 열며 화면의 text, controls, links, **graphics**를 빠르게 찾아갈 수 있습니다. citeturn23search3

이미지 테스트에서 확인할 것은:

```text
informative image
  → 의미 있는 description을 읽음

decorative image
  → 불필요하게 읽지 않음

chart
  → short description
  → 상세 설명/data에 접근 가능

broken/missing alt
  → filename 같은 noise가 나오지 않음
```

Apple은 웹의 graph/chart에 지원되는 경우 Audio Graphs가 VoiceOver rotor에 나타날 수 있다고 설명합니다. 하지만 Unfold가 접근성을 이 기능 하나에 의존해서는 안 됩니다. text alternative와 data representation이 기본이고 audio graph는 추가적인 user-agent 기능으로 보는 것이 안전합니다. citeturn25view2

Chrome을 목표로 한다면 **Apple 문서에 나온 VoiceOver 기능만 확인하고 끝내서는 안 됩니다**. 브라우저와 assistive technology의 accessibility API 연결에서 구현 차이가 생길 수 있으므로 실제 배포 대상 Chrome stable + 실제 macOS VoiceOver 조합을 regression matrix에 포함해야 합니다. Chrome도 DevTools accessibility 문서에서 keyboard와 screen-reader navigation의 수동 테스트 필요성을 명시하고 있습니다. citeturn17search17

**F. Agent UI 접근성**

Side Panel 상태는 다음처럼 구분하는 것이 좋습니다.

| 상태 | 추천 방식 | Focus 이동 |
|---|---|---|
| 분석 중 | `role="status"` | 하지 않음 |
| 문서 발견 | `role="status"` | 하지 않음 |
| 문서 추가 완료 | `role="status"` | 하지 않음 |
| 전체 결과 완료 | `role="status"` + 명시적 결과 이동 control | 기본적으로 하지 않음 |
| 비차단 오류 | `role="alert"` | 보통 하지 않음 |
| 해결해야 진행 가능한 오류 | `alertdialog` 또는 오류 영역 + 적절한 focus | 필요 |
| 새로운 modal/dialog | APG dialog focus rules | dialog 내부로 이동 |

WCAG 4.1.3의 취지는 **상태를 알리기 위해 사용자의 focus를 빼앗지 않는 것**입니다. citeturn14search5

예:

```html
<div
  id="agent-status"
  role="status"
>
  문서 구조를 분석하고 있습니다.
</div>
```

ARIA 1.2에서 `status`는 사용자에게 advisory information을 전달하는 live region이며 일반 상태 변화 때문에 focus를 받을 필요가 없습니다. `role="status"`는 polite live-region 동작을 위한 의미를 제공합니다. citeturn24search1

분석 진행률을 다음처럼 너무 자주 업데이트하면:

```text
1%
2%
3%
4%
...
```

스크린 리더가 계속 발화할 수 있습니다. 따라서 사용자에게 의미 있는 milestone만 announce하는 것이 좋습니다.

```text
문서를 발견했습니다.
↓
페이지 구조를 분석하고 있습니다.
↓
표와 이미지를 분석하고 있습니다.
↓
문서 분석이 완료되었습니다.
```

오류는 긴급도에 따라 다릅니다.

```html
<div role="alert">
  문서를 분석하지 못했습니다. 다시 시도해주세요.
</div>
```

ARIA 1.2의 `alert`는 assertive live region이며 implicit `aria-live="assertive"`, `aria-atomic="true"`를 갖습니다. W3C는 alert를 전달하기 위해 focus를 이동할 필요가 없으며, 오히려 focus를 메시지로 옮기고 싶다면 `alertdialog`를 고려하라고 명시합니다. citeturn24search1

즉:

```text
background completion
  → status

recoverable error
  → alert

user must make decision now
  → dialog / alertdialog
```

로 구분하는 것이 좋습니다.

또한 **상태가 바뀔 때마다 focus를 Agent Panel로 강제로 가져오는 것은 피해야 합니다**. 사용자가 문서를 읽다가 "분석 완료" 때문에 갑자기 Side Panel로 이동하면 읽던 위치가 사라집니다. focus order는 의미와 operability를 보존해야 합니다. citeturn24search6

**G. Source Jump 접근성**

"근거 보기"는 Unfold의 핵심 interaction이므로 접근성 모델 자체에 넣는 것을 권합니다.

각 DocumentNode가:

```json
{
  "id": "paragraph-42",
  "sourceReference": {
    "page": 7,
    "bbox": [85, 240, 510, 330]
  }
}
```

를 갖고, AI answer citation이:

```json
{
  "citationId": "answer-citation-3",
  "targetNodeId": "paragraph-42"
}
```

를 가리키게 합니다.

동일 document 안의 navigation이면 native anchor가 가장 좋습니다.

```html
<a href="#paragraph-42">
  근거 3 보기
</a>
```

Side Panel과 document가 서로 다른 DOM context라면 action button이 더 정확합니다.

```html
<button
  type="button"
  data-target="paragraph-42"
>
  근거 3 보기
</button>
```

그 뒤 document context에서 대상 element를 찾습니다.

```html
<p
  id="paragraph-42"
  tabindex="-1"
>
  ...
</p>
```

`tabindex="-1"`은 이 paragraph를 일반 Tab 순서에는 넣지 않으면서 programmatic focus destination으로 사용할 수 있게 합니다. WCAG Focus Order guidance는 static content 자체에 programmatic focus를 주는 것을 금지하지 않으며, 그 결과가 혼란스러운 focus order를 만들지 않아야 한다고 설명합니다. citeturn24search6

추천 sequence는:

```text
사용자:
"근거 3 보기" 활성화
        ↓
target DOM 찾기
        ↓
scroll target into view
        ↓
target.focus()
        ↓
screen reader가 target context 읽음
        ↓
visual source highlight
```

입니다.

**Focus가 주된 접근성 메커니즘이어야 하고 live region은 보조 수단이어야 합니다.** 둘 다 장황하게 읽히면 VoiceOver가 같은 정보를 두 번 발화할 수 있습니다.

예를 들어 상태 announcement는 짧게:

```text
"근거 3, 7페이지로 이동"
```

하고 실제 paragraph를 focus해서 본문을 읽게 하는 방식이 좋습니다.

시각적 highlight는 keyboard focus indicator를 가려서는 안 됩니다. WCAG 2.2의 Focus Visible은 키보드 focus indicator가 보이는 mode를 요구합니다. citeturn24search4

예:

```css
.source-highlight {
  /* background/highlight treatment */
}

.source-highlight:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 4px;
}
```

실제 색상 값과 contrast는 제품 디자인 시스템에서 검증해야 합니다.

"노란색으로만 표시"처럼 색 하나에만 의미를 맡기기보다는:

```text
scroll 위치
+ focus
+ outline
+ source label
```

처럼 여러 신호를 결합하는 편이 좋습니다.

그리고 반드시 **return path**를 제공하는 것을 권합니다.

```text
근거 보기
   ↓
Accessible Document View
   ↓
"답변으로 돌아가기"
```

Source Jump는 사실상 **bidirectional citation navigation**으로 설계하면 스크린 리더 사용자에게 훨씬 유용합니다.

## 검증 전략과 MVP 접근성 수준

**H. 자동 테스트 Checklist**

자동 검사는 크게 **표준 rule 검사**와 **Unfold-specific structural invariant 검사**를 분리하는 것이 좋습니다.

axe-core는 현재 WCAG 2.0, 2.1, 2.2 관련 자동 rule을 제공하며, 공식 repository는 평균적으로 WCAG 이슈의 약 **57%를 자동 발견할 수 있고**, 확실히 판단할 수 없는 요소는 `incomplete`로 반환해 manual review가 필요하다고 명시합니다. citeturn25view0turn25view1

따라서:

```text
axe violations == 0
       ≠
WCAG conformant
```

입니다.

### CI에서 반드시 자동화할 항목

| 자동 검사 | P0 기준 |
|---|---|
| axe-core WCAG A/AA rule | `serious`, `critical` 0 |
| axe `incomplete` | 접근성 QA backlog로 수집 |
| accessible name 누락 | 0 |
| invalid ARIA | 0 |
| duplicate IDs | 0 |
| form label 누락 | 0 |
| empty/invalid links | 0 |
| contrast | WCAG target에 맞게 통과 |
| positive tabindex | 0 |
| heading model invariant | 모든 문서에 outline 생성 |
| table header references | unresolved `headers` 0 |
| table cell overlap | 0 |
| Source Jump target | unresolved target 0 |
| live-region state | 주요 상태마다 unit test |
| source provenance | 모든 AI citation target 존재 |

axe-core는 functional test 환경에도 통합하도록 만들어져 있으므로 generated document의 초기 상태뿐 아니라 **dialog open, 분석 완료, error, Source Jump 후 상태**에도 검사하는 것이 좋습니다. axe-core 프로젝트 역시 새 UI가 노출되는 시점마다 `axe.run()`을 실행하는 integration pattern을 제시합니다. citeturn25view0

Lighthouse는 accessibility audit을 포함하는 Chrome의 자동화 도구이고, Accessibility score는 accessibility audits의 weighted average입니다. 그러나 Lighthouse 자체에도 자동 검사할 수 없는 manual audit 항목이 존재합니다. 따라서 **Lighthouse 100은 WCAG conformance certificate가 아닙니다.** citeturn17search1turn17search5turn17search13

Accessibility Insights for Web의 FastPass는 automated checks와 Tab Stops 검사로 common high-impact 문제를 빠르게 확인할 수 있고, Assessment는 WCAG 2.1 AA 평가를 지원합니다. 따라서 WCAG 2.2를 목표로 하는 Unfold에서는 보조 도구로 유용하지만 이것만으로 2.2 전체를 검증할 수는 없습니다. citeturn18search1

추천 역할 분담은 다음과 같습니다.

```text
axe-core
  → CI regression

Lighthouse
  → browser-level quick audit

Accessibility Insights
  → keyboard/tab + guided manual assessment

custom Unfold tests
  → document semantics

VoiceOver
  → actual AT experience

human review
  → semantic correctness
```

**I. 수동 VoiceOver 테스트 Checklist**

MVP release gate로는 다음 정도가 현실적입니다.

| 시나리오 | Pass 조건 |
|---|---|
| 문서 첫 진입 | 문서 title과 main content 위치를 이해 가능 |
| Heading rotor | 모든 주요 section이 올바른 순서와 수준으로 노출 |
| Heading level filtering | h2/h3 filtering 결과가 실제 hierarchy와 일치 |
| Link rotor | `"여기"`, `"클릭"` 같은 모호한 standalone link 없음 |
| Landmark rotor | document navigation/main 구조가 명확 |
| Simple table | row/column header가 올바르게 announce |
| Complex table | multi-level header context를 이해 가능 |
| Informative image | filename이 아니라 의미 있는 alt가 announce |
| Decorative image | 불필요한 graphics noise 없음 |
| Complex chart | short description에서 상세 description/data로 접근 가능 |
| Form controls | label, role, state, required/error가 이해 가능 |
| Agent 분석 중 | status가 announce되지만 focus 유지 |
| Agent 완료 | 완료 announcement 후 읽던 위치 유지 |
| Agent 오류 | 오류가 즉시 announce되고 복구 action을 찾을 수 있음 |
| Source Jump | focus, scroll, speech, visual highlight가 동일 target을 가리킴 |
| Source return | AI answer의 기존 위치로 복귀 가능 |
| Linear reading | 다단/페이지 경계에서도 문장이 올바른 순서 |
| Tab navigation | keyboard trap과 불필요한 focus stop 없음 |

테스트 기록에는 단순히 "VoiceOver Pass"라고 쓰지 말고:

```text
macOS version
Chrome version
VoiceOver settings
document fixture
expected announcement
actual announcement
pass/fail
```

을 남기는 편이 좋습니다. Browser와 AT 조합의 실제 동작을 검증하는 것이 자동 markup 검사와 다른 수동 검증의 역할입니다. citeturn17search17turn23search6

### 추천 fixture set

해커톤이라도 다음 10개 정도의 golden document fixture를 고정해 두는 것을 권합니다.

```text
01 plain text report
02 nested headings
03 ordered/unordered lists
04 simple table
05 row+column header table
06 multi-level merged table
07 two-column PDF
08 image-heavy report
09 chart-heavy report
10 form + checkbox + hyperlink
```

각 문서에 expected semantic tree를 만들어 두면 Upstage/AI prompt나 model이 바뀌었을 때 접근성 regression을 수치화할 수 있습니다.

예를 들어:

```text
heading F1
table cell association accuracy
reading-order pair accuracy
figure-caption association accuracy
source-jump resolution rate
```

를 model quality metric으로 두는 것이 좋습니다.

**J. MVP에서 주장할 수 있는 접근성 수준**

표현의 강도는 매우 중요합니다.

| 표현 | 의미 | MVP 사용 권장 |
|---|---|---|
| **WCAG 2.2 conformant** | 정의된 scope에서 해당 conformance level의 모든 적용 가능한 성공 기준을 충족 | **아직 사용하지 않는 것을 권장** |
| **WCAG-informed** | 공식 conformance 용어가 아니라 WCAG를 설계 근거로 사용했다는 의미 | 사용 가능하나 더 구체적인 문구 권장 |
| **accessible** | 폭넓고 비공식적이며 범위가 불명확 | 단독 절대 표현보다 조건 명시 |
| **screen-reader-friendly** | 비공식 표현, 시각/운동/인지 접근성 전체보다 훨씬 좁음 | 제한적 사용 가능 |
| **PDF/UA compliant** | PDF 파일 자체가 해당 ISO PDF/UA 요구사항을 충족 | HTML view에는 **사용 불가** |
| **KWCAG 2.2 준수** | 한국 국가표준 검사항목을 대상 범위에서 만족한다는 강한 주장 | 전체 검증 전에는 피하는 것이 안전 |

WCAG conformance는 "일부 기준을 잘 지켰다"는 의미가 아닙니다. W3C는 Level AA conformance라면 Level A와 AA의 모든 적용 가능한 success criteria를 만족해야 한다고 설명합니다. citeturn17search3turn17search15

공식 conformance claim을 한다면 guideline version, level, scope, 날짜, relied-upon technologies 등의 정보를 명확히 하는 방식이 사용됩니다. citeturn24search3

따라서 해커톤 MVP에 가장 적합한 문구는 다음입니다.

> **"Unfold는 WCAG 2.2와 KWCAG 2.2를 기반으로 문서의 논리 구조를 Semantic HTML로 재구성하고, macOS VoiceOver + Chrome에서 핵심 문서 탐색 시나리오를 검증하는 Accessible Document View를 제공합니다."**

조금 더 짧게는:

> **"WCAG 2.2 기반 Semantic HTML과 VoiceOver 검증을 적용한 접근성 우선 문서 뷰"**

가 좋습니다.

다음 표현은 현재 단계에서는 피하는 것을 권합니다.

> **"모든 PDF를 완벽하게 접근 가능한 문서로 변환합니다."**

> **"WCAG 2.2 AA 완벽 준수"**

> **"PDF/UA 문서로 변환합니다."**

> **"100% screen reader compatible"**

AI가 reading order, heading hierarchy, complex table association, 이미지 의미를 잘못 추론할 수 있는 이상 **접근성이 완벽하다**는 주장은 기술적으로 방어하기 어렵습니다. WCAG 자체도 conformance testing에 automation과 human evaluation이 모두 필요하며, 모든 success criteria를 만족하더라도 모든 장애 사용자에게 완벽하게 usable하다는 뜻은 아니라고 설명합니다. citeturn17search3

대신 해커톤에서 훨씬 설득력 있는 것은 측정 가능한 결과입니다.

```text
10개 golden fixture

axe serious/critical violation: 0
source-jump resolution: 100%
simple table header association: 100%
heading structure fixture: 100%
VoiceOver P0 scenarios: 15/15 pass
```

같은 식입니다.

### PDF/UA 표현의 정확한 경계

현재 ISO에는 PDF/UA-1인 **ISO 14289-1:2014**와 PDF/UA-2인 **ISO 14289-2:2024**가 존재합니다. PDF/UA-2는 PDF 2.0 기반 접근 가능한 PDF 문서를 다룹니다. citeturn10search2turn10search0

Unfold의 output이 HTML이면 **PDF/UA output이라고 부를 수 없습니다**. PDF/UA는 PDF 파일의 구조와 접근성에 대한 표준이기 때문입니다. 대신 다음처럼 설명할 수 있습니다.

```text
Input:
PDF / PDF-UA / HWP / Office

            ↓

Semantic Document Model

            ↓

Output:
WCAG-oriented Accessible HTML View
```

또한 source PDF에 이미 tags와 logical structure가 있으면 vision AI보다 그 정보를 우선순위 높은 semantic signal로 사용하는 것이 좋습니다. 이는 PDF/UA 구조 정보를 버리고 다시 시각 추론하는 것보다 정보 손실 위험이 낮습니다. PDF/UA 자체가 PDF의 semantic structure를 통해 접근 가능한 디지털 문서를 만드는 표준이라는 점에 기반한 제품 설계 권고입니다. citeturn10search0turn10search2

**K. P0 / P1 기능**

해커톤 MVP에서는 아래처럼 자르는 것이 좋습니다.

| 우선순위 | 기능 | 이유 |
|---|---|---|
| **P0** | paragraph, list, heading semantic reconstruction | 문서 탐색의 기반 |
| **P0** | logical DOM reading order | 틀리면 전체 문서 이해가 무너짐 |
| **P0** | `<title>` + document `<h1>` | orientation |
| **P0** | simple/row-column semantic tables | 문서에서 접근성 영향이 큼 |
| **P0** | `rowspan` / `colspan` 복원 | merged table 최소 요건 |
| **P0** | multi-level table header association | AI document agent 차별점 |
| **P0** | image alt + decorative discrimination | WCAG 1.1.1 핵심 |
| **P0** | complex image visible description fallback | hallucination 위험 완화 |
| **P0** | Agent `status` / `alert` | Side Panel 사용 가능성 |
| **P0** | keyboard focus visible | 기본 keyboard 접근성 |
| **P0** | Source Jump: scroll + focus + highlight | Agent ↔ Document 핵심 UX |
| **P0** | axe-core CI | regression 방지 |
| **P0** | Chrome + VoiceOver smoke suite | 실제 목표 환경 검증 |
| **P0** | semantic confidence + abstention | AI 오판을 접근성 오류로 확정하지 않기 위해 필요 |
| **P1** | DPub footnote/noteref/backlink | 긴 보고서 탐색 고도화 |
| **P1** | `doc-pagebreak` / 원본 pagination | 법률, 학술문서 citation에 유용 |
| **P1** | chart underlying data table | chart 접근성 크게 향상 |
| **P1** | irregular table alternate linear view | 매우 복잡한 표 fallback |
| **P1** | human correction UI | AI hierarchy/header 수정 |
| **P1** | accessible document outline/TOC | 장문 문서 탐색 |
| **P1** | AI-description provenance UI | 신뢰성 |
| **P1** | PDF tags 우선 ingestion | Tagged PDF 품질 활용 |
| **P1** | broader AT matrix | Safari+VoiceOver, NVDA+Chrome 등 |
| **P1** | WCAG/KWCAG formal audit matrix | 실제 conformance claim 준비 |

해커톤에서 기술적 wow point와 접근성 효과를 동시에 보여주려면 **"AI가 PDF를 읽어 HTML로 바꾼다"보다 다음 3개의 demonstration을 중심으로 잡는 편이 강합니다.**

```text
PDF의 다단 reading order
      ↓
VoiceOver가 자연스럽게 읽음

복잡한 merged table
      ↓
VoiceOver가 정확한 row/column header를 읽음

AI answer citation
      ↓
"근거 보기"
      ↓
정확한 문단으로 scroll + focus + announce
```

이 세 가지는 단순 OCR보다 Unfold의 **Document Agent + Accessibility Model**이라는 제품 아이디어를 훨씬 명확하게 보여줍니다.

## 한국 표준과 전체 표준 출처

**L. 모든 표준 출처**

### KWCAG 현재 상태

2026년 8월 22일 기준 국립전파연구원에 게시된 현재 한국형 웹 콘텐츠 접근성 국가표준은 **"한국형 웹 콘텐츠 접근성 지침 2.2", KS X OT0003**이며 제개정일은 **2022년 12월 28일**입니다. citeturn19search0

NIA는 이 개정에서 기존 24개 검사항목에 9개를 추가했다고 밝혔습니다. 총 33개 검사 항목입니다. 추가 항목은 다음 영역입니다. citeturn20search2

| KWCAG 2.2 신규 영역 | Unfold 관련성 |
|---|---|
| 문자 단축키 | Extension keyboard command가 있으면 관련 |
| 고정된 참조 위치 정보 | 문서 위치/맥락 UI 설계와 관련 가능 |
| 단일 포인터 입력 지원 | touch/pointer UI가 있다면 관련 |
| 포인터 입력 취소 | pointer interaction이 있다면 관련 |
| 레이블과 네임 | Agent control 이름에 직접 관련 |
| 동작기반 작동 | motion interaction이 있다면 관련 |
| 찾기 쉬운 도움 정보 | 서비스 전체 UI 관련 |
| 접근 가능한 인증 | 로그인 존재 시 관련 |
| 반복 입력 정보 | form workflow가 있다면 관련 |

NIA는 KWCAG 2.2 개정이 WCAG 2.1/2.2의 최신 개정 내용을 반영했다고 설명합니다. 동시에 KWCAG의 해설 자료는 WCAG 2.1을 주요 참조표준으로 설명합니다. 즉 **KWCAG 2.2는 W3C WCAG 2.2를 단순 번역하거나 성공 기준을 1:1 복제한 규격으로 이해하면 안 됩니다.** 국내 환경에 맞춘 별도 국가표준과 검사체계를 갖습니다. citeturn20search2turn19search2

특히 KWCAG 2.2는 2022년 12월에 제정됐으므로 이후 확정된 W3C WCAG 2.2와 동일한 기준 집합으로 취급하는 것은 안전하지 않습니다. 따라서 Unfold는 다음처럼 **두 개의 별도 compliance matrix**를 갖는 것이 좋습니다. citeturn19search0turn3search3

```text
Unfold requirement
        │
        ├── WCAG 2.2 SC
        │
        └── KWCAG 2.2 inspection item
```

예:

```text
Semantic heading/table structure
  ├ WCAG 1.3.1 Info and Relationships
  └ KWCAG 관련 구조/제목 검사 항목

Logical reading order
  ├ WCAG 1.3.2 Meaningful Sequence
  └ KWCAG 콘텐츠 선형화

Image alternative
  ├ WCAG 1.1.1 Non-text Content
  └ KWCAG 적절한 대체 텍스트
```

또 하나 중요한 차이는 WCAG가 A, AA, AAA **conformance level과 success criteria** 중심인 반면, KWCAG는 국내 서비스 평가에서 사용되는 **검사항목 체계**로 구성되어 있다는 점입니다. 따라서 `"WCAG 2.2 AA"`와 `"KWCAG 2.2 준수"`를 같은 표현처럼 상호 치환해서는 안 됩니다. citeturn17search3turn19search0turn20search2

### Unfold가 기준으로 삼을 Source of Truth

| 표준 / 문서 | Unfold에서의 역할 | 공식 출처 |
|---|---|---|
| **WCAG 2.2** | 최상위 accessibility requirement, A/AA 기준 | W3C WCAG 2.2 citeturn3search3turn17search7 |
| **WCAG Understanding** | 각 SC의 목적과 해석 | W3C citeturn17search11turn17search3 |
| **WAI Tutorials: Tables, Images, Headings** | 문서 semantic implementation guidance | W3C citeturn1search5turn11search7turn1search0 |
| **WAI-ARIA 1.2** | live regions, states, supplemental semantics | W3C Recommendation citeturn21search2turn24search1 |
| **ARIA Authoring Practices Guide** | Agent widget, focus, interactive pattern | W3C APG citeturn21search9turn21search3 |
| **DPub-ARIA 1.1** | footnote, noteref, pagebreak 등 출판 문서 semantics | W3C Recommendation citeturn24search0 |
| **HTML Living Standard** | 실제 HTML 요소, table model, figure semantics | WHATWG. 2026-08-21 기준 Living Standard가 갱신되어 있습니다. citeturn21search10turn21search0 |
| **Apple VoiceOver User Guide** | macOS AT 실제 탐색 behavior | Apple citeturn23search1turn25view2turn23search3 |
| **KWCAG 2.2 / KS X OT0003** | 한국 웹 접근성 국가표준 | 국립전파연구원 citeturn19search0 |
| **KWCAG 2.2 개정 설명** | 33개 검사항목, 신규 9개 항목 | NIA citeturn20search2 |
| **PDF/UA-1** | PDF 1.x 계열 접근성 표준 | ISO 14289-1:2014 citeturn10search2 |
| **PDF/UA-2** | PDF 2.0 접근성 표준 | ISO 14289-2:2024 citeturn10search0 |
| **axe-core** | CI 자동 accessibility regression | Deque axe-core 공식 repository citeturn25view0 |
| **Lighthouse Accessibility** | Chrome 기반 자동 audit | Chrome for Developers citeturn17search1turn17search5 |
| **Accessibility Insights** | automated checks, tab stop, guided assessment | Accessibility Insights 공식 문서 citeturn18search1 |

Unfold의 표준 우선순위는 다음처럼 정의하는 것이 가장 깔끔합니다.

```text
Normative requirement
  WCAG 2.2
  KWCAG 2.2

             ↓

Host language semantics
  HTML Living Standard

             ↓

Supplemental semantics
  WAI-ARIA 1.2
  DPub-ARIA 1.1

             ↓

Implementation guidance
  WAI Tutorials
  ARIA APG

             ↓

Real assistive-technology behavior
  VoiceOver + Chrome

             ↓

Regression detection
  axe-core
  Lighthouse
  Accessibility Insights
  custom structural tests
```

결론적으로 Unfold의 핵심 기술 정의는 **"PDF를 HTML로 바꾸는 converter"보다 "visual document에서 accessible semantic document graph를 복원하는 compiler"**에 가깝습니다. WCAG의 핵심 요구는 단순히 ARIA attribute를 많이 붙이는 것이 아니라 정보, 관계, 읽기 순서와 control의 의미가 프로그램적으로 결정 가능하도록 만드는 것이고, HTML과 WAI-ARIA 모두 native semantics를 우선하도록 설계되어 있습니다. citeturn0search7turn3search3turn21search2

따라서 MVP의 가장 중요한 성공 기준은 **"axe가 100점인가"가 아니라 "AI가 복원한 semantic graph가 실제 사용자가 탐색하는 문서 구조와 얼마나 일치하는가"**입니다. 자동 검사는 명백한 markup 오류와 regression을 잡는 safety net이고, heading hierarchy, complex table 관계, 이미지 설명의 정확성, 실제 reading order, Source Jump context는 결국 VoiceOver와 인간의 의미 판단으로 검증해야 합니다. axe-core 자체도 자동 검사로 평균 약 57%의 WCAG 이슈를 발견하며 나머지에는 manual review가 필요하다고 명시하고 있고, WCAG 역시 conformance 평가와 실제 usability 검증을 구분합니다. citeturn25view0turn17search3