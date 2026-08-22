# UP²STAGE Development & Implementation Spec v1.1

- 문서 상태: 구현 기준 확정본
- 작성일: 2026-08-23
- 제품: UP²STAGE
- 구현 형태: Chrome Extension + 독립 Viewer Page
- 핵심 가치: Structured · Trusted · Accessible
- 핵심 문장: Every Answer Has a Place.
- Agent 기준: `UP2STAGE General Document Guidance v0.22` 고정
- 주요 디자인 기준: Figma `jucntionX-Design / 최종작업중`
- 발표 흐름 기준: `260823_ bara.pptx` 및 발표자 노트

---

# 0. 문서 목적

이 문서는 UP²STAGE를 실제로 구현하기 위한 개발 기준 문서다.

프로덕트의 핵심은 사용자가 현재 보고 있는 웹페이지와 그 페이지에 연결된 여러 문서를 직접 하나씩 열고 비교하지 않아도, UP²STAGE가 문서의 역할과 구조를 이해하고 핵심 정보를 정리하며, 사용자의 질문이나 상황 판단이 실제 원문의 근거로 다시 연결되도록 만드는 것이다.

이 문서의 범위는 다음을 포함한다.

1. Chrome Extension 구조
2. URL Rule 기반 Contextual Overlay
3. 현재 페이지의 첨부문서 발견
4. 문서 선택 및 외부 AI 전송 동의
5. Upstage Agent v0.22 실행 및 결과 정규화
6. Initial Guidance
7. Dynamic Quick Question
8. 사용자 조건 기반 판단
9. Section Chunking
10. Upstage Search
11. Solar 기반 자유 질문
12. Source Registry와 Evidence Model
13. PDF / HWP(HWPX) / XLSX Viewer
14. 원문 Highlight
15. Accessible Semantic View
16. Side Panel과 Viewer Page의 상세 Layout
17. Local Cache / 상태 관리
18. 오류 처리
19. 개인정보 및 보안
20. 테스트 및 Definition of Done

이 문서는 해커톤 P0 구현을 우선하지만, P0 구현이 이후 Document Context Layer로 확장될 수 있도록 데이터 경계와 모듈 경계를 명확하게 둔다.

---

# 1. 제품 정의

## 1.1 해결하려는 문제

UP²STAGE가 해결하는 문제는 "긴 문서를 읽기 어렵다"가 아니다.

실제 사용자는 하나의 기회를 판단하기 위해 다음을 동시에 수행해야 한다.

- 현재 웹페이지에서 관련 문서를 발견한다.
- PDF, HWP, HWPX, XLSX 등의 파일을 각각 연다.
- 각 문서가 어떤 역할인지 이해한다.
- 신청 자격, 마감, 제출서류, 예외, 작성 규칙을 비교한다.
- 자신의 상황을 조건에 대입한다.
- 중요한 판단의 원문 근거를 다시 확인한다.

따라서 핵심 문제는 다음과 같다.

> 여러 문서에 흩어진 정보를 하나의 행동 가능한 판단으로 통합해야 한다.

UP²STAGE는 이를 다음 과정으로 바꾼다.

```text
Discover
→ Understand
→ Verify
→ Act
```

---

# 2. P0 범위와 비범위

## 2.1 P0에서 반드시 구현

### Browser Entry
- Chrome Extension
- 현재 Tab URL 확인
- URL Rule 기반 Contextual Overlay
- 현재 페이지의 첨부문서 링크 탐색
- Side Panel 열기

### Side Panel
- API Key 설정
- 관련 문서 발견
- 문서 선택
- 외부 AI 처리 동의
- Agent Job 생성
- Processing 상태
- Initial Guidance
- Quick Question Form
- 입력 확인
- 조건별 Decision
- 추천 질문 Chip
- 자유 질문 Chat

### Document Intelligence
- Agent v0.22
- `include=all` 기준 Parse/Classify/Extract/Instruct 결과 수신
- Parse Element Registry
- Extract 결과 정규화
- Quick Question 정규화 및 중복 제거
- Initial Guidance
- Section Chunking
- Upstage Search
- Solar
- Evidence Source ID validation

### Viewer
- 독립 Extension Viewer Page
- Document Selector
- Document Outline
- PDF Renderer
- HWP/HWPX Renderer
- XLSX Readonly Renderer
- Evidence Overlay
- Source Highlight
- Summary / Evidence Panel
- Accessible Semantic View
- Keyboard Navigation
- Screen Reader Friendly Structure

### Storage
- IndexedDB 기반 Case Cache
- Document/Parse/Extract/Source/Question/Answer 저장
- 동일 문서 재처리 최소화

---

## 2.2 P0에서 하지 않음

다음은 P0에서 구현하지 않는다.

- 문서 편집
- HWP/DOCX/PPTX를 완전한 Office Editor 수준으로 재현
- 모든 포맷의 native text drag selection
- 인터넷 전체 문서 crawling
- 백그라운드 상시 변경 감지
- 기관용 Embed SDK
- 서버 운영
- 계정 기반 Cloud Sync
- 완전 자동 행정 신청
- 모든 문서 충돌의 자동 해결
- 모든 WCAG/PDF-UA 문제 자동 remediation

---

# 3. 최종 아키텍처

```text
┌──────────────────────────────────────────────────────────────┐
│                       Current Web Page                       │
│                                                              │
│ URL Rule → Contextual Overlay                                │
│ DOM Attachment Discovery                                    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     Chrome Side Panel                        │
│                                                              │
│ Discover → Select → Consent → Process → Guidance             │
│                              ↓                               │
│                         Quick Check                          │
│                              ↓                               │
│                         Free-form Q&A                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌────────────────── Upstage Studio Agent v0.22 ────────────────┐
│                                                              │
│ Parse                                                        │
│   ↓                                                          │
│ Classify + Split                                             │
│   ↓                                                          │
│ Role-specific Extract                                        │
│   ↓                                                          │
│ Initial Guidance Instruct                                     │
└────────────────────────────┬─────────────────────────────────┘
                             │ include=all
                             ▼
┌────────────────────── UP²STAGE Runtime ──────────────────────┐
│                                                              │
│ Agent Output Adapter                                         │
│ Case Registry                                                │
│ Source Registry                                              │
│ Quick Question Normalizer                                    │
│ Decision Engine                                              │
│ SectionChunker                                               │
│ Search Adapter                                               │
│ Solar Adapter                                                │
│ Evidence Resolver / Validator                                │
│ Conflict Detector                                            │
│ Cache                                                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────── Viewer Page ─────────────────────────┐
│                                                              │
│ Document Outline | Original Renderer | Guidance / Evidence   │
│                  | Evidence Overlay  |                       │
│                  | Semantic Layer    |                       │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. 기술 스택

## 4.1 Core

| 영역 | 라이브러리 / 기술 |
|---|---|
| Extension Framework | WXT |
| Manifest | Chrome Manifest V3 |
| Language | TypeScript `strict` |
| UI | React |
| Styling | Tailwind CSS 4 |
| UI Primitive | shadcn/ui, 필요한 컴포넌트만 |
| Schema Validation | Zod |
| Local DB | Dexie + IndexedDB |
| Local UI State | Zustand |
| Extension Messaging | `@webext-core/messaging` |
| HTTP | native `fetch`, `AbortController` |
| Hash | Web Crypto `crypto.subtle.digest('SHA-256')` |
| Sanitization | DOMPurify |

## 4.2 Viewer

| 포맷 | 구현 |
|---|---|
| PDF | `pdfjs-dist` |
| HWP/HWPX | `@rhwp/core` 기반 readonly renderer adapter |
| XLSX | SheetJS CE + custom grid |
| Large Spreadsheet Virtualization | `@tanstack/react-virtual` |
| Semantic View | Parse Element → 자체 React semantic renderer |

## 4.3 Test

| 종류 | 도구 |
|---|---|
| Unit | Vitest |
| Component | React Testing Library |
| Extension E2E | Playwright |
| Accessibility | `@axe-core/playwright` |

---

# 5. Repository 구조

```text
up2stage/
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   ├── sidepanel/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── viewer/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── ViewerApp.tsx
│   └── options/
│       └── ...
│
├── src/
│   ├── core/
│   │   ├── agent/
│   │   │   ├── agent-client.ts
│   │   │   ├── agent-job.ts
│   │   │   ├── output-adapter.ts
│   │   │   └── schemas.ts
│   │   ├── search/
│   │   │   ├── search-client.ts
│   │   │   ├── section-chunker.ts
│   │   │   └── search-index.ts
│   │   ├── solar/
│   │   │   ├── solar-client.ts
│   │   │   ├── prompts.ts
│   │   │   └── schemas.ts
│   │   ├── evidence/
│   │   │   ├── source-registry.ts
│   │   │   ├── source-id.ts
│   │   │   ├── evidence-resolver.ts
│   │   │   └── evidence-validator.ts
│   │   ├── decision/
│   │   │   ├── question-normalizer.ts
│   │   │   ├── deterministic-evaluator.ts
│   │   │   ├── decision-composer.ts
│   │   │   └── conflicts.ts
│   │   ├── storage/
│   │   │   ├── db.ts
│   │   │   ├── tables.ts
│   │   │   └── cache.ts
│   │   └── messaging/
│   │       └── protocol.ts
│   │
│   ├── features/
│   │   ├── contextual-overlay/
│   │   ├── discovery/
│   │   ├── document-selection/
│   │   ├── processing/
│   │   ├── guidance/
│   │   ├── quick-check/
│   │   ├── qa/
│   │   ├── source-navigation/
│   │   └── accessibility/
│   │
│   ├── renderers/
│   │   ├── pdf/
│   │   ├── hwp/
│   │   ├── xlsx/
│   │   └── semantic/
│   │
│   ├── components/
│   │   ├── panel/
│   │   ├── evidence/
│   │   ├── document/
│   │   ├── form/
│   │   └── common/
│   │
│   ├── models/
│   ├── utils/
│   └── styles/
│
├── test/
│   ├── fixtures/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
├── wxt.config.ts
├── tsconfig.json
└── package.json
```

원칙:

> Feature 컴포넌트에서 Upstage API를 직접 호출하지 않는다.

항상 `src/core/*`의 adapter를 통한다.

---

# 6. Extension Entry Point 책임

## 6.1 `background.ts`

Background Service Worker는 오래 걸리는 작업을 직접 수행하지 않는다.

책임:

- extension icon click
- side panel open 요청
- tab change event
- content ↔ side panel message routing
- optional host permission 요청
- viewer tab 생성
- runtime event bridge

금지:

- Agent 장시간 polling
- 대형 Parse JSON 처리
- Search Index 생성
- PDF/HWP rendering
- Solar 장기 요청 orchestration

---

## 6.2 `content.ts`

책임:

- 현재 URL 확인
- Contextual Rule match
- Contextual Overlay mount/unmount
- DOM 기반 attachment discovery
- page metadata 수집
- Side Panel에 current page context 전달

---

## 6.3 Side Panel

Side Panel이 Case Orchestrator다.

책임:

- current page context
- discovered document selection
- file download
- Agent Job 시작
- Agent Job polling
- Agent Result normalization
- IndexedDB 저장
- Initial Guidance 화면
- Quick Question / Decision
- Search / Solar Q&A orchestration
- Viewer open

---

## 6.4 Viewer

Viewer는 별도 extension page로 연다.

예:

```text
chrome-extension://<id>/viewer.html?case=<caseId>&document=<documentId>&source=<sourceId>
```

책임:

- 원본 파일 렌더
- 문서 목차
- Evidence Highlight
- Source navigation
- Semantic Accessible View
- 오른쪽 Guidance panel

---

# 7. Manifest / Permission

P0 기본 권한:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "https://api.upstage.ai/*"
  ]
}
```

원칙:

- 기본 `<all_urls>` 금지
- cookies 미사용
- browsing history 미사용
- file access는 필요할 때 별도 UX
- 다른 origin의 첨부 파일 접근이 필요한 경우 optional permission으로 요청
- 사용자가 선택하지 않은 문서를 외부로 전송하지 않음

---

# 8. Case 모델

하나의 현재 페이지와 사용자가 선택한 문서 묶음을 `Case`로 본다.

```ts
export interface CaseRecord {
  id: string;

  sourcePage: {
    url: string;
    title: string;
    normalizedUrl: string;
  };

  status:
    | 'discovered'
    | 'ready'
    | 'processing'
    | 'processed'
    | 'failed';

  selectedDocumentIds: string[];

  agentJobId?: string;
  vectorStoreId?: string;

  createdAt: number;
  updatedAt: number;
}
```

Case는 장학금이라는 도메인에 종속되지 않는다.

---

# 9. Document 모델

```ts
export type DocumentRole =
  | 'primary_notice'
  | 'requirements_checklist'
  | 'application_form'
  | 'procedure_guide'
  | 'reference_material'
  | 'amendment_update'
  | 'other';

export interface DocumentRecord {
  id: string;
  caseId: string;

  originalUrl?: string;
  fileName: string;
  mimeType?: string;
  extension: string;
  size?: number;

  contentHash: string;

  role?: DocumentRole;
  roleConfidence?: number;

  upstageFileId?: string;

  renderType:
    | 'pdf'
    | 'hwp'
    | 'hwpx'
    | 'xlsx'
    | 'unsupported';

  createdAt: number;
}
```

`contentHash`는 cache key로 사용한다.

```text
SHA-256(file bytes)
```

---

# 10. URL Rule 기반 Contextual Overlay

## 10.1 목표

P0에서는 모든 사이트를 AI로 분석해 "이 페이지가 기회 페이지인가?"를 판단하지 않는다.

고정 Demo URL 또는 명시적인 URL rule을 사용한다.

```ts
export interface ContextRule {
  id: string;
  match(url: URL): boolean;

  label?: string;
  attachmentSelectors?: string[];
}
```

예:

```ts
const rules: ContextRule[] = [
  {
    id: 'demo-scholarship',
    match: (url) =>
      url.hostname === 'example.org' &&
      url.pathname.startsWith('/scholarship/')
  }
];
```

---

## 10.2 Overlay Layout

Overlay는 페이지 UI를 덮는 제품 본체가 아니다.

위치:

```text
position: fixed
right: 24px
bottom: 24px
width: 336px
z-index: 높은 extension overlay layer
```

내용:

```text
◆ UP²STAGE

이 페이지와 관련된 문서를 확인할 수 있어요.
조건, 마감, 제출서류를 함께 정리합니다.

[관련 문서 확인하기 →]    [닫기]
```

행동:

```text
CTA click
→ background message
→ chrome.sidePanel.open()
→ DISCOVERY 상태
```

닫기는 현재 tab/session에서만 suppress해도 된다.

---

# 11. Attachment Discovery

## 11.1 기본 탐색

현재 DOM의 다음 요소를 확인한다.

```text
a[href]
button[data-url]
iframe[src]
embed[src]
object[data]
```

우선 지원 확장자:

```text
.pdf
.hwp
.hwpx
.xlsx
.docx
.pptx
```

P0 Viewer는 PDF/HWP/HWPX/XLSX 중심이지만 Agent 입력 후보는 지원 포맷 전체를 탐색할 수 있다.

---

## 11.2 Attachment 후보 모델

```ts
export interface DiscoveredAttachment {
  id: string;
  url: string;
  fileName: string;

  extension?: string;
  label?: string;

  sourceElementText?: string;

  selected: boolean;
  accessible: boolean;
}
```

중복 제거:

```text
canonical URL
+ inferred filename
```

---

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
- 좌측: UP²STAGE mark + name
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

# 23. Source Registry

UP²STAGE의 핵심 데이터 구조.

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

# 46. SectionChunker

Search 전에 Extension이 실행.

우선순위:

```text
1. Explicit Heading
2. Numbered Structure
3. Table/List Boundary
4. Length Boundary
```

지원 구조:

```text
1.
1-1.
가.
나.
①
②
제1조
붙임 1
```

페이지 경계만으로 chunk하지 않는다.

---

# 47. Chunk 크기

초기값:

```text
target: 700 tokens
max: 1200 tokens
min: 180 tokens
overlap: 120 tokens
```

정확한 값은 POC 후 조정.

---

# 48. Search Document

각 chunk를 retrieval용 Markdown으로 구성.

```md
# {document title}

Role: procedure_guide
Section: 신청 방법 > 제출 완료

{short retrieval context}

## 원문
...
```

Search용 title/summary는 근거가 아니다.

---

# 49. ChunkRecord

```ts
export interface ChunkRecord {
  id: string;
  caseId: string;
  documentId: string;

  role?: DocumentRole;

  sectionPath: string[];
  text: string;

  sourceIds: string[];
  pages: number[];

  contentHash: string;
}
```

---

# 50. Upstage Search

Search 역할:

> 어디를 봐야 하는지 좁힌다.

```text
Question
↓
Search
↓
Top K Section
```

기본:

```text
topK = 5
```

결과가 부족하면 최대 10.

Search result 자체는 Evidence로 쓰지 않는다.

---

# 51. Candidate Element Resolve

Search hit:

```text
chunkId
↓
ChunkRecord.sourceIds
↓
SourceRegistry
↓
Candidate SourceRecords
```

이 candidate들만 Solar에 제공한다.

---

# 52. Solar Contract

입력:

```text
user question
user profile, 필요한 경우
relevant extract facts
candidate source records
```

출력 예:

```ts
export interface SolarAnswer {
  answer: string;

  decision?: DecisionStatus;

  evidenceSourceIds: string[];

  missingInformation: string[];
  nextActions: string[];
}
```

Structured Output으로 제한하는 것이 좋다.

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

# 54. Conflict Detector

다문서 제품이므로 conflict를 first-class로 둔다.

관계:

```text
supports
duplicates
conflicts
supersedes
```

P0 자동 precedence:

```text
amendment_update가
명시적으로 target_document / changed item을 지목
→ supersedes
```

그 외:

```text
문서 A: 7월 29일 이후
문서 B: 3월 16일 이후

→ conflict
→ 사용자에게 둘 다 표시
```

임의로 "primary_notice가 무조건 진실"로 처리하지 않는다.

---

# 55. Viewer Page Layout

1440px 기준 Figma Layout:

```text
┌──────────────┬───────────────────────────────┬─────────────────────┐
│ Outline      │ Document Workspace            │ UP²STAGE Panel      │
│              │                               │                     │
│ 224px        │ flexible (~773px)             │ 443px               │
│              │                               │                     │
└──────────────┴───────────────────────────────┴─────────────────────┘
```

Chrome toolbar 제외 컨텐츠 높이 약 `946px`.

Responsive:

```css
.viewer {
  display: grid;
  grid-template-columns:
    var(--outline-width, 224px)
    minmax(0, 1fr)
    var(--guidance-width, 443px);
}
```

좁은 화면에서는 Outline을 drawer로 접을 수 있게 한다.

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

# 66. Viewer Right Panel

폭:

```text
443px
```

Side Panel과 동일한 브랜드/컴포넌트 체계를 재사용.

Mode별 content만 다르게 한다.

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

실제 구현에서는 중앙 Renderer의 display mode가 바뀌고 오른쪽 Panel context는 유지한다.

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

# 74. Storage

Dexie schema 개념:

```text
cases
documents
parseElements
sources
extracts
guidance
quickQuestions
userAnswers
decisions
chunks
searchIndexes
chatMessages
conflicts
actionItems
```

---

# 75. Cache

## Document Cache Key

```text
contentHash
+
agentVersion
```

예:

```text
sha256(file) + "agent-v0.22"
```

동일하면 Agent 재처리하지 않는다.

Case마다 document relationship만 새로 연결.

---

# 76. Search Cache

```text
contentHash
+
chunkerVersion
```

Chunk text가 동일하면 Search Index를 재사용할 수 있게 구조를 둔다.

P0에서는 Case 단위 index라도 모델은 재사용 가능한 형태로 작성.

---

# 77. UI State vs Canonical State

### IndexedDB
- Case
- Documents
- Agent results
- Sources
- Answers
- User inputs
- Checklist state

### Zustand
- 현재 선택 tab
- panel state
- form draft
- open popover
- viewer zoom
- current source selection

Redux는 사용하지 않는다.

---

# 78. Messaging Protocol

예:

```ts
interface Protocol {
  openSidePanel(data: {
    tabId: number;
  }): void;

  currentPageContext(): Promise<PageContext>;

  discoverAttachments(): Promise<DiscoveredAttachment[]>;

  openViewer(data: {
    caseId: string;
    documentId: string;
    sourceId?: string;
  }): void;
}
```

Message payload는 Zod validate.

---

# 79. Network Client

공통 wrapper:

```ts
async function request<T>(
  input: RequestInfo,
  init: RequestInit,
  schema: ZodSchema<T>
): Promise<T>
```

기능:

- timeout
- abort
- JSON parse
- status error
- schema validation
- retry policy
- 로그 sanitization

---

# 80. Retry

### File Upload
- 네트워크 오류: 1~2회 retry

### Agent Submit
- 자동 중복 submit 방지

### Polling
- exponential-ish interval
- 최대 interval 제한

예:

```text
2s → 3s → 5s → 8s → 10s 유지
```

### Search/Solar
- 429/5xx 조건부 retry
- 사용자 cancel 지원

---

# 81. Cancel

Processing 화면에 P0에서는 반드시 버튼이 없어도 되지만 내부적으로 Abort 가능하게 구현.

```ts
AbortController
```

Side Panel이 닫혀도 Agent Job 자체는 계속될 수 있으므로 Case에 `agentJobId`를 저장해 재진입 시 polling resume.

---

# 82. Resume

Side Panel reopen:

```text
Case exists
+
agentJobId exists
+
status processing
↓
Job status fetch
↓
Processing UI resume
```

이 기능은 해커톤 demo 안정성에 중요하다.

---

# 83. Error UX

## Attachment fetch 실패

```text
일부 문서를 가져오지 못했어요.

✓ 공고문.pdf
! 신청서.hwp

[다시 시도] [가능한 문서만 분석]
```

## Agent 실패

```text
문서를 처리하지 못했어요.
선택한 파일은 그대로 유지됩니다.

[다시 시도]
```

## Unsupported viewer

```text
이 형식은 아직 원문 Viewer를 지원하지 않아요.
구조화된 문서 보기로 확인할 수 있습니다.

[구조 보기]
```

---

# 84. Security / Privacy

원칙:

1. 사용자가 선택한 문서만 전송
2. 전송 전 동의
3. API Key 로그 금지
4. 원본 문서 내용 console log 금지
5. 필요한 경우 local cache 삭제 제공
6. 페이지 전체 browsing history 저장 금지
7. Case source URL은 해당 분석에 필요한 범위로만 보관
8. User Quick Question 값은 해당 Case 판단에만 사용
9. Chat prompt에 불필요한 사용자 입력을 붙이지 않음

---

# 85. Logging

개발 로그는 다음 정도만.

```ts
logger.info('agent_job_submitted', {
  caseId,
  documentCount,
  jobId
});
```

금지:

```text
원문 전체
API Key
사용자 답변 원문
개인정보
```

---

# 86. Performance 목표

현재 Agent 자체 baseline을 더 줄이기 위해 schema를 훼손하지 않는다.

UI 목표:

```text
Overlay display          < 150ms 체감
Side Panel initial load  < 500ms
Local cached case open   < 500ms
Quick Form open          즉시
Cached Quick Action      즉시
Source navigation        < 300ms 체감
Viewer page shell        < 1s
```

Agent는 async processing UI로 감싼다.

---

# 87. Agent 결과 소비 우선순위

새 기능보다 현재 output을 최대한 재활용한다.

```text
title/issuer
→ Context card

key_requirements
→ 주요 조건

key_dates
→ deadline/timeline

required_submissions
→ 제출 Checklist

conditional_submissions
→ 조건부 Checklist

quick_questions
→ Dynamic Form

critical_cautions
→ 놓치면 안 되는 것

next_actions_seed
→ Action Checklist

format_constraints
→ 작성 규칙

form_cautions
→ 작성 위험요소

procedure steps
→ 진행 순서

completion_checks
→ 완료 확인
```

---

# 88. Demo Flow

실제 발표/데모 기준:

```text
1. 실제 공고 웹페이지 진입

2. URL Rule이 Contextual Overlay 표시
   "관련 문서를 함께 확인할 수 있어요"

3. Overlay CTA
   → Side Panel

4. 관련 문서 Discovery

5. 문서 선택 + AI 처리 고지

6. 분석 시작

7. Processing
   파일별 진행 상태

8. Initial Guidance
   주요 조건
   마감
   제출물
   주의사항

9. "내 조건 확인하기"

10. Agent quick_questions 기반 Dynamic Form

11. 입력 Confirm

12. 조건별 Decision
    충족
    미충족
    확인 필요

13. Source 클릭

14. Viewer Page 이동

15. Left Outline
    Center Original Document
    Right Evidence Summary

16. Source Highlight

17. Accessible View 전환

18. Keyboard / screen reader navigation
```

---

# 89. Figma Layout 기준 컴포넌트 목록

## Side Panel

```text
ExtensionHeader
CurrentPageCard
DocumentChip
DocumentSelectionRow
ConsentNotice
ProcessingDocumentRow
ResultCard
NextStepCard
SuggestionChip
ChatComposer
QuickQuestionField
DecisionStatusChip
ConditionResultRow
ActionChecklist
SourcePreviewPopover
```

## Viewer

```text
DocumentSelector
DocumentOutlineDrawer
DocumentOutlineRow
ViewerWorkspace
PageSurface
EvidenceOverlay
EvidenceNumberBadge
ViewerModeTabs
SummaryReferenceRow
SourceNavigationHelp
AccessibleDocument
```

---

# 90. Design Token 방향

Figma에서 사용 중인 주요 의미 토큰을 코드에서도 의미 기반으로 유지.

```css
--color-bg-inverse: #0a0d14;
--color-bg-inverse-surface: #111722;
--color-brand-lime: #d2ff95;
--color-action-primary: #5b52ff;

--color-text-primary: #0a0d14;
--color-text-on-inverse: #ffffff;
--color-text-inverse-secondary: #8390a5;

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

실제 값은 Figma token export와 맞춰 최종 선언.

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

# 92. Unit Test 필수 대상

- URL rule
- attachment discovery
- extension filter
- filename inference
- content hash
- Agent output parser
- `additional_values` parser
- Quick Question parser
- Quick Question dedupe
- Source ID generation
- Source Registry lookup
- SectionChunker
- numeric decision
- boolean decision
- date decision
- evidence validation
- conflict relation
- source coordinate transform

---

# 93. Integration Test

Fixture:

```text
공고문.pdf
자기소개서.hwp
참고 목록.xlsx
체크리스트.hwp
신청방법.pdf
```

확인:

```text
5 files
→ expected roles
→ expected canonical records
→ quick questions
→ initial guidance
→ source links
```

---

# 94. Viewer Test

### PDF
- page navigation
- zoom
- source highlight
- selected outline sync

### HWP
- render 성공
- source element navigation
- fallback semantic view

### XLSX
- large list rendering
- virtualization
- search/row navigation

---

# 95. Accessibility Test

자동:

```text
axe
```

수동:

- keyboard only
- VoiceOver
- visible focus
- heading navigation
- table announcement
- source click 후 semantic focus

---

# 96. E2E 시나리오

```text
Demo URL 진입
↓
Overlay 표시
↓
Open Panel
↓
Select 3 docs
↓
Consent
↓
Fixture Agent result load / mock
↓
Guidance
↓
Quick Form
↓
Answer
↓
Decision
↓
Source click
↓
Viewer
↓
Highlight
```

실제 API E2E와 fixture E2E를 분리한다.

Demo 직전에는 fixture fallback을 둘지 팀 내 결정.

---

# 97. 구현 순서

## Phase 1 — Shell

1. WXT 프로젝트
2. Side Panel
3. Content Script
4. URL Overlay
5. Messaging
6. Viewer route

## Phase 2 — Discovery

7. DOM attachment discovery
8. Selection UI
9. Consent
10. file download

## Phase 3 — Agent

11. Upload client
12. Job submit
13. Job polling
14. Output Adapter
15. Dexie persistence

## Phase 4 — Guidance

16. Initial Guidance
17. Quick Question parser
18. Dynamic Form
19. Condition breakdown
20. Checklist/Caution UI

## Phase 5 — Evidence

21. Source Registry
22. Instruct citation adapter
23. navigateToSource

## Phase 6 — Viewer

24. Viewer Shell
25. Outline
26. PDF
27. HWP/HWPX
28. XLSX
29. Evidence Overlay

## Phase 7 — Retrieval

30. SectionChunker
31. Search
32. Solar
33. Evidence Validator

## Phase 8 — Accessibility

34. Semantic Tree
35. Accessible View
36. Keyboard
37. VoiceOver QA

---

# 98. 해커톤 시간 부족 시 절대 우선순위

반드시 살릴 것:

```text
URL Overlay
Side Panel discovery/select
Agent
Guidance
Quick Question
Decision Breakdown
Source Link
PDF Viewer Highlight
Accessible Semantic View
```

시간 부족 시 줄일 것:

```text
HWP pixel fidelity
XLSX 고급 UI
Chat history
복잡한 conflict UI
hover animation
고급 transition
native drag selection
```

---

# 99. 구현 Definition of Done

## Entry
- [ ] Demo URL에서 Overlay 표시
- [ ] Overlay가 Side Panel을 연다

## Documents
- [ ] 현재 페이지의 첨부문서를 발견한다
- [ ] 사용자 선택 전 업로드하지 않는다
- [ ] 선택/동의 후 Agent에 전달한다

## Agent
- [ ] v0.22로 Job 생성
- [ ] `include=all` 결과 처리
- [ ] Parse/Classify/Extract/Instruct를 canonical data로 저장

## Guidance
- [ ] 주요 조건
- [ ] 마감
- [ ] 제출물
- [ ] 주의사항
- [ ] Next Action 표시

## Quick Check
- [ ] Quick Question을 Agent output으로 만든다
- [ ] Select options를 Agent data에서 가져온다
- [ ] 중복 질문 제거
- [ ] 필수/선택 구분
- [ ] 조건별 결과 표시
- [ ] 미입력 조건 표시

## Evidence
- [ ] Parse element에 Source ID 생성
- [ ] Guidance/Decision source와 연결
- [ ] 존재하지 않는 Source ID는 표시하지 않음

## Viewer
- [ ] PDF 렌더
- [ ] HWP/HWPX 렌더 또는 안정적 fallback
- [ ] XLSX readonly 렌더
- [ ] Outline navigation
- [ ] Evidence Highlight
- [ ] source click → 해당 위치 이동

## Accessibility
- [ ] Semantic View
- [ ] Heading 구조
- [ ] Table semantic
- [ ] Keyboard navigation
- [ ] VoiceOver로 핵심 demo flow 탐색

## Reliability
- [ ] Side Panel reopen 시 processing resume
- [ ] 동일 파일 cache 재사용
- [ ] Network error retry
- [ ] API Key / 원문 console logging 없음

---

# 100. 구현 판단 원칙

기능을 추가할 때 아래 순서로 판단한다.

### 1. 이미 Agent가 뽑은 데이터인가?
그렇다면 새 AI 호출 없이 UI에서 먼저 재사용한다.

### 2. deterministic하게 처리할 수 있는가?
그렇다면 LLM에 넘기지 않는다.

### 3. Search가 해결할 문제인가?
전체 문서 재추출 대신 retrieval을 사용한다.

### 4. Solar가 필요한가?
자연어 의미 판단이나 복합 조건에만 사용한다.

### 5. 근거로 돌아갈 수 있는가?
사용자에게 중요한 판단이라면 Source ID가 없으면 최종 결과로 확정하지 않는다.

---

# 101. 최종 기술 원칙

```text
Studio
= 문서를 구조화하고 핵심 사실을 준비한다.

Extension
= Case를 조직하고 문서 경험을 연결한다.

Search
= 어디를 볼지 좁힌다.

Solar
= 근거 범위 안에서 의미를 판단한다.

Source Registry
= 모든 판단을 원문으로 되돌린다.

Viewer
= 같은 문서를 시각적·구조적·접근 가능한 방식으로 탐색하게 한다.
```

최종 제품 원칙:

> Intelligence should not hide the document. It should unfold it.

그리고 구현 수준의 가장 중요한 invariant는 다음이다.

> Every Answer Has a Place.
