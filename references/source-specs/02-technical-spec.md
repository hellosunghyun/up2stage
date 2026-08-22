# UP²STAGE Technical Spec v1.0 Final

최종 확정일: 2026-08-23  
대상: JunctionX Korea 2026 Upstage Track / Team GOODMORNING  
제품: UP²STAGE — Unfold Pages to Structured, Trusted, Accessible Guidance for Everyone.

---

## 0. 결론

UP²STAGE는 서버를 별도로 두지 않는 Chrome Manifest V3 Extension 기반 Document Guidance Agent다.

핵심 책임 분리는 다음으로 확정한다.

```text
Web Page + Selected Attachments
        ↓
Upstage Studio Agent v0.22
Parse → Classify + Split → Role-specific Extract → Initial Guidance Instruct
        ↓
UP²STAGE Extension Runtime
Case Registry → Quick Question Normalize → SectionChunker → Upstage Search → Solar
        ↓
Evidence / Decision Runtime
Source Registry → Deterministic Rules → Conflict Resolver → Evidence-bound Answer
        ↓
Experience Layer
Side Panel → Original Viewer → Evidence Overlay → Semantic Accessible View → VoiceOver/Keyboard
```

Studio는 문서를 이해하고 구조화하는 역할만 맡는다. Extension은 여러 문서를 하나의 Case로 묶고, 검색·질문·개인화·근거·뷰어·접근성을 orchestration한다.

---

# 1. 제품 범위

## 1.1 Primary User

P0의 대표 사용자는 학교·공공기관·재단 등에서 지원·신청·행정 정보를 확인하는 대학생이다.

단, Agent 구조는 장학금 전용이 아니다. 동일 구조로 다음 유형을 처리할 수 있어야 한다.

- 장학금 / 지원사업
- 인턴십 / 채용
- 교환학생 / 기숙사
- 공모전 / 행사 신청
- 복지 / 청년 정책
- 학사·행정 절차
- 각종 신청·접수형 공공 문서

## 1.2 Product Promise

사용자는 여러 파일을 각각 읽는 대신 다음을 빠르게 얻는다.

1. 무엇에 관한 문서 묶음인지
2. 가장 중요한 요건과 일정
3. 무엇을 제출해야 하는지
4. 본인 조건을 확인하려면 무엇을 입력해야 하는지
5. 지금 무엇을 해야 하는지
6. 판단의 원문 근거가 정확히 어디에 있는지
7. 동일 문서를 키보드·스크린리더로 구조적으로 탐색하는 방법

핵심 문장:

> Every Answer Has a Place.

---

# 2. 확정 기술 스택

## 2.1 Core

| 영역 | 확정 기술 | 사용 이유 |
|---|---|---|
| Extension Framework | WXT | MV3, React entrypoint, Side Panel, background/content/viewer 구성, Vite 기반 개발 속도 |
| Language | TypeScript strict | Agent/API/Viewer 사이 데이터 계약 강제 |
| UI | React | Side Panel, Viewer, Semantic View 공통 컴포넌트 구성 |
| Styling | Tailwind CSS 4 | 해커톤 속도, 디자인 토큰 통일 |
| Component primitives | shadcn/ui를 필요한 컴포넌트만 선택 적용 | Dialog, Sheet, Button, Form 등 빠른 구현. native semantic element 우선 |
| Runtime validation | Zod 4 | Upstage API 결과와 내부 canonical model 런타임 검증 |
| Persistent local DB | Dexie 4 / IndexedDB | Case, 문서, Parse 결과, Source Registry, 캐시 저장 |
| Ephemeral UI state | Zustand | 현재 선택 문서, viewer state, pending interaction 등 UI-local 상태 |
| Extension messaging | @webext-core/messaging | sidepanel/background/content/viewer 간 type-safe 메시징 |
| HTTP | native fetch + AbortController | axios 등 추가 의존성 없이 Upstage API 직접 호출 |
| Hash | Web Crypto SHA-256 | document hash, cache key, source identity 생성 |

Redux/Redux Toolkit은 사용하지 않는다. Extension의 여러 실행 context 사이 canonical state를 Redux로 공유할 수 없으므로, 영속·공유 상태는 IndexedDB(Dexie), 화면별 ephemeral state만 Zustand로 둔다.

## 2.2 Viewer

| Format | P0 Renderer | Interaction |
|---|---|---|
| PDF | `pdfjs-dist` | 페이지 render, zoom, text selection, polygon/word highlight |
| HWP/HWPX | `@rhwp/core` | read-only page render(SVG/Canvas), element highlight |
| XLSX | SheetJS CE + custom React grid + `@tanstack/react-virtual` | sheet/row/cell 탐색, cell-level evidence target |
| HTML/Semantic | React semantic renderer + DOMPurify | heading/list/table navigation, VoiceOver |
| DOCX/PPTX | P1 adapter | P0에서는 Semantic View 우선 |

HWP 편집 기능은 필요하지 않으므로 `@rhwp/editor`가 아니라 `@rhwp/core`를 사용한다.

XLSX도 편집기를 넣지 않는다. SheetJS로 workbook model을 읽고 필요한 셀만 virtualized grid로 표시한다.

## 2.3 Testing

- Vitest
- React Testing Library
- `@webext-core/fake-browser` 또는 WXT test helper
- Playwright: 실제 Chromium extension E2E
- `@axe-core/playwright`: accessibility smoke test
- MSW: Upstage API fixture/mock가 필요할 때만 사용

---

# 3. Chrome Extension Architecture

## 3.1 Entry Points

```text
entrypoints/
├── background.ts              # 아주 짧은 이벤트/메시지 라우팅
├── content.ts                 # 현재 페이지 분석, attachment discovery, launcher
├── sidepanel/                 # 메인 제품 UI + 장기 API orchestration
│   ├── index.html
│   └── App.tsx
├── viewer/                    # 별도 extension tab의 Document Viewer
│   ├── index.html
│   └── App.tsx
└── options/                   # API key / local settings
```

## 3.2 Service Worker 원칙

Manifest V3 background service worker는 장시간 polling이나 대용량 문서 processing의 owner가 되지 않는다.

담당:

- action click / tab event
- Side Panel enable/open
- context 간 message routing
- 짧은 permission request orchestration

비담당:

- Agent Job 장기 polling
- Search indexing
- Solar streaming
- 대형 JSON parsing
- Viewer rendering

장기 작업은 Side Panel 또는 Viewer 같은 살아 있는 extension document에서 수행한다.

## 3.3 Manifest Permissions

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

정책:

- `cookies`: 사용 안 함
- `history`: 사용 안 함
- `downloads`: P0에서 사용 안 함. 원본 파일은 fetch Blob으로 처리
- `<all_urls>` 영구 host permission: 사용 안 함
- 필요 시 attachment가 별도 origin이면 `optional_host_permissions`를 사용자 action 시 요청
- file:// local document는 P1

---

# 4. Page / Attachment Discovery

## 4.1 Content Script 역할

현재 탭에서 다음 정보를 수집한다.

```ts
interface PageContext {
  url: string
  title: string
  candidateAttachments: AttachmentCandidate[]
}
```

탐색 대상:

- `<a href>`
- 명시적 download link
- 확장자 기반 PDF/HWP/HWPX/DOCX/PPTX/XLSX/Image
- URL/current page가 직접 문서인 경우

지원 확장자 판단은 URL suffix만 믿지 않고, 가능하면 response `Content-Type`과 `Content-Disposition`도 확인한다.

## 4.2 Upload Consent

자동 외부 전송은 금지한다.

Flow:

```text
첨부 발견
→ 사용자에게 파일 목록 표시
→ 사용자가 분석할 파일 선택
→ "선택한 문서를 Upstage로 전송해 분석" 명시
→ 실행
```

P0 제한:

- 한 Case 최대 5개 문서
- 비정상적으로 큰 파일은 전송 전 warning
- 동일 문서 SHA-256 hash가 로컬 캐시에 있으면 재처리 여부 확인

---

# 5. Upstage Studio Agent v0.22 — FIXED

Agent는 더 이상 구조 변경하지 않는다. 최적화 대상은 Extension Runtime이다.

## 5.1 Parse

```text
modelName: document-parse
mode: auto
ocrMode: auto
lang: ko
coordinates: true
outputFormats: html, markdown
chartRecognition: false
mergeMultipageTables: false
base64Encoding: []
```

목적:

- 문서 구조 복원
- HTML/Markdown 생성
- page/element/coordinates 확보
- Viewer와 Search의 source base 생성

## 5.2 Classify + File Split

확정 role:

```text
primary_notice
requirements_checklist
application_form
procedure_guide
reference_material
amendment_update
other
```

의미:

- `primary_notice`: 중심 공고·모집·지원 안내
- `requirements_checklist`: 자격·요건·체크·예외
- `application_form`: 작성/서명 제출 양식
- `procedure_guide`: 순서가 있는 사용·제출 절차
- `reference_material`: 목록·FAQ·표·부록·lookup 자료
- `amendment_update`: 정정·변경·대체 안내
- `other`: 안전한 fallback

`reference_material`은 의도적으로 Extract하지 않는다.

## 5.3 Role-specific Extract

### primary_notice_extract

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

### requirements_checklist_extract

```text
document_title
requirements
exclusions_or_failure_conditions
exceptions
required_evidence
quick_questions
cautions
```

### application_form_extract

```text
form_title
form_type
required_fields
required_signatures
required_attachments
format_constraints
form_cautions
```

### procedure_extract

```text
guide_title
steps
channels
file_rules
completion_checks
procedure_cautions
```

### amendment_extract

```text
target_document
effective_date
changes
superseded_items
amendment_cautions
```

`location=true`를 유지한다.

## 5.4 Initial Guidance Instruct

연결:

```text
primary_notice_extract
→ initial_guidance
```

목적은 사용자 개인 판정이 아니라 첫 화면에 필요한 UI-ready summary 생성이다.

출력 contract:

```ts
interface InitialGuidance {
  overview: string
  top_requirements: string[]
  nearest_deadline: string
  required_submissions: string[]
  top_cautions: string[]
  next_actions: string[]
  missing_information: string[]
  personalization_status: 'not_evaluated'
}
```

Agent 결과는 `include=all`로 받아 Parse/Classify/Extract/Instruct 결과를 모두 보존한다.

---

# 6. Canonical Data Model

Studio output을 UI에서 직접 사용하지 않는다. 수신 즉시 canonical model로 normalize한다.

## 6.1 Case

```ts
interface CaseRecord {
  caseId: string
  sourcePageUrl: string
  createdAt: number
  updatedAt: number
  status: 'discovered' | 'processing' | 'ready' | 'error'
  documentIds: string[]
  vectorStoreId?: string
}
```

## 6.2 Document

```ts
interface DocumentRecord {
  documentId: string
  caseId: string
  fileName: string
  mimeType: string
  extension: string
  sha256: string
  blob?: Blob
  upstageFileId?: string
  documentRole?: DocumentRole
  pageCount?: number
}
```

## 6.3 Parsed Element

```ts
interface ParsedElement {
  sourceId: string
  documentId: string
  elementId: string | number
  page: number
  category: string
  text: string
  markdown?: string
  html?: string
  polygon?: Point[]       // normalized 0..1
  words?: WordGeometry[]
}
```

## 6.4 Source Record

Source ID는 모델이 생성하지 않는다.

```ts
sourceId = `src:${documentId}:p${page}:e${elementId}`
```

elementId가 안정적이지 않은 경우 WebCrypto hash를 fallback으로 사용한다.

```ts
SHA256(documentId + page + elementOrder + normalizedText)
```

SourceRecord는 Evidence 시스템의 canonical identity다.

## 6.5 Evidence Target

포맷에 따라 evidence target 방식을 다르게 허용한다.

```ts
type EvidenceTarget =
  | { kind: 'polygon'; page: number; polygon: Point[] }
  | { kind: 'word'; page: number; wordPolygons: Point[][] }
  | { kind: 'cell'; sheet: string; range: string }
  | { kind: 'semantic'; semanticNodeId: string }
```

---

# 7. Source Registry / Evidence Model

원칙:

> 모든 사용자-facing 판단은 실제 SourceRecord로 돌아갈 수 있어야 한다.

증거가 될 수 있는 것:

- Parse element
- Extract field의 location
- Instruct citation이 가리키는 실제 source

증거가 될 수 없는 것:

- AI가 생성한 요약 문장 자체
- Search chunk의 H1/summary header
- 모델이 임의 생성한 ID

Flow:

```text
Parse element
→ SourceRecord 생성
→ Extract location ↔ SourceRecord resolve
→ Instruct citation ↔ SourceRecord resolve
→ Search chunk에 sourceIds만 참조
→ Solar는 candidate sourceIds 중 선택
→ Answer가 evidenceSourceIds 반환
```

---

# 8. Quick Question Runtime

Quick Question은 Agent에서 미리 Extract한다.

Source:

```text
primary_notice_extract.quick_questions
requirements_checklist_extract.quick_questions
```

Extension에서 두 source를 normalize/dedupe한다.

## 8.1 Canonical Question

```ts
interface QuickQuestion {
  id: string
  key: string
  label: string
  inputType: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'organization_select'
  required: boolean
  options?: string[]
  ruleText?: string
  sourceIds: string[]
}
```

## 8.2 Deduplication

우선순위:

1. exact normalized key
2. 동일 source requirement
3. label semantic similarity

충돌하지 않는 경우 primary_notice 질문을 대표 question으로 사용하고 checklist source를 추가 evidence로 merge한다.

사용자가 Quick Action을 누를 때 LLM 호출을 하지 않는다. 이미 준비된 질문을 즉시 render한다.

---

# 9. Decision Engine

개인화 판단을 전부 Solar에 맡기지 않는다.

## 9.1 Deterministic First

코드로 안전하게 판정 가능한 것:

- boolean
- 숫자 threshold
- 날짜
- exact option
- reference list membership

예:

```text
성적 >= 90
지원구간 <= 4
현재 날짜 <= deadline
기관 이름이 reference_material에 존재
```

## 9.2 Solar Needed

다음만 Solar로 넘긴다.

- 자연어 조건의 의미 비교
- 복합 예외
- 여러 문서가 서로 다른 표현을 사용한 경우
- 단순 operator로 표현하기 어려운 eligibility
- 자유 질문

최종 상태:

```text
eligible
ineligible
needs_more_information
conflict
```

Solar가 근거 없이 eligible/ineligible을 만들 수 없다.

---

# 10. Conflict Resolver

여러 문서를 다루는 제품이므로 conflict는 정상적인 first-class state다.

관계:

```text
supports
duplicates
conflicts
supersedes
```

해결 규칙:

1. amendment_update가 명시적으로 특정 문서/항목을 대체하면 `supersedes`
2. 명시적인 정정 관계가 없으면 임의로 "더 중요해 보이는 문서"를 우선하지 않는다
3. 날짜·마감·자격·서류 조건이 다르면 `conflict`
4. conflict 상태에서는 사용자에게 두 근거를 동시에 보여준다
5. Solar는 관계 설명에는 사용할 수 있지만 source priority를 임의 생성하지 않는다

---

# 11. SectionChunker

Parse Markdown 전체를 그대로 Search에 넣지 않는다.

## 11.1 Boundary Priority

1. 실제 heading
2. 번호 구조 (`1.`, `1-1.`, `가.`, `①`, `제1조`)
3. 독립된 table/list
4. 길이 limit
5. 필요 시 semantic topic shift(P1)

페이지 경계 자체는 section boundary가 아니다.

## 11.2 Chunk Defaults

```text
target: 약 700 tokens
max: 1200
min: 180
overlap: 120
```

작은 section은 인접 section과 병합한다.

## 11.3 Search Document Shape

```text
# Document Title
Role: procedure_guide
Section: 신청방법 > 제출
Chunk-ID: chk_xxx

[검색용 한 줄 설명]

[원문 section body]
```

검색용 title/summary는 evidence가 아니다.

각 chunk metadata:

```ts
{
  chunkId,
  caseId,
  documentId,
  role,
  sectionPath,
  sourceIds,
  pages,
  contentHash
}
```

---

# 12. Upstage Search

P0는 Embed 2를 직접 사용하지 않는다.

Case마다 Search scope를 격리한다.

```text
Case
→ Section Markdown files
→ Upstage Vector Store / File Search
→ top_k 5
→ 부족하면 top_k 10 fallback
```

추천 구현은 section 하나를 작은 Markdown search document로 만들고, 파일명/registry를 통해 chunkId와 sourceIds를 역매핑하는 방식이다.

Search 책임:

> 어디를 봐야 하는지 찾는다.

Search 결과를 곧바로 최종 답의 citation으로 사용하지 않는다.

---

# 13. Solar Runtime

Solar 책임:

> 찾아낸 범위에서 무엇이 실제로 질문의 근거인지 판단한다.

입력:

- 사용자 질문
- user profile answers
- Search top hits
- candidate ParsedElement / SourceRecord
- 필요한 role-specific extracts

출력은 JSON schema로 제한한다.

```ts
interface SolarAnswer {
  answer: string
  decision?: 'eligible' | 'ineligible' | 'needs_more_information' | 'conflict'
  evidenceSourceIds: string[]
  missingInformation: string[]
  nextActions: string[]
}
```

Validator:

- 모든 evidenceSourceId가 현재 Case Source Registry에 존재해야 함
- 존재하지 않는 source ID가 있으면 answer reject/retry
- evidence가 없으면 unsupported answer를 생성하지 않고 insufficient evidence 상태로 반환

---

# 14. Viewer Architecture

## 14.1 공통 Viewer Shell

```text
Viewer Shell
├── Document List / Tabs
├── Toolbar
│   ├── zoom
│   ├── page
│   ├── Original / Accessible
│   └── Evidence navigation
├── Format Renderer Adapter
├── Evidence Overlay
└── Source Details
```

## 14.2 Renderer Interface

```ts
interface DocumentRenderer {
  supports(doc: DocumentRecord): boolean
  load(blob: Blob): Promise<void>
  getPageCount(): number
  renderPage(page: number, scale: number): Promise<RenderSurface>
  focusEvidence(target: EvidenceTarget): Promise<void>
}
```

## 14.3 PDF

`pdfjs-dist` 사용.

Layer:

```text
PDF Canvas
Text Layer
Evidence Overlay
Interaction Layer
```

지원:

- native-like text selection
- zoom
- word/polygon highlight
- current evidence scroll/focus

## 14.4 HWP/HWPX

`@rhwp/core` 사용.

- HWP5/HWPX parsing
- page layout
- SVG/Canvas render
- read-only

Upstage normalized polygon은 렌더된 page bounds에 곱해 overlay한다.

```text
screenX = normalizedX * pageWidth
screenY = normalizedY * pageHeight
```

폰트/레이아웃 차이로 polygon drift가 큰 경우 틀린 highlight를 강제로 보여주지 않고 element-level semantic focus로 fallback한다.

## 14.5 XLSX

SheetJS CE로 workbook을 읽는다.

표시:

- worksheet tabs
- merged cells
- basic widths/heights
- values/formula result
- virtualized rows/columns

Evidence는 PDF식 polygon을 억지로 맞추기보다 cell identity로 resolve한다.

```text
Sheet1!B42
```

---

# 15. Accessible Semantic View

접근성은 별도 장애인 모드가 아니라 동일 Source Model의 다른 표현이다.

```text
Original View
      ↕ Source ID
Semantic Accessible View
      ↕ Source ID
Intelligence Guidance
```

구현 원칙:

- Parse element hierarchy를 semantic tree로 변환
- native HTML 우선
- ARIA는 native semantics로 해결되지 않는 경우에만 사용
- heading level 유지
- list는 `<ol>/<ul>`
- table은 `<table>`, `<th scope>`
- figure description은 출처/AI-generated 여부 구분
- evidence focus 시 해당 semantic node에도 focus 이동 가능

필수 keyboard UX:

- heading outline
- source next/previous
- document switch
- evidence jump
- focus visible

VoiceOver는 별도 텍스트를 새로 만드는 것이 아니라 같은 semantic DOM을 읽는다.

---

# 16. Local Storage / Cache

## 16.1 Dexie Tables

```text
cases
documents
parseElements
extracts
guidance
quickQuestions
sources
chunks
searchIndexes
answers
conflicts
userProfiles
```

## 16.2 Cache Key

```text
documentHash = SHA256(fileBytes)
agentCacheKey = SHA256(documentHash + agentVersion)
searchCacheKey = SHA256(chunkContent + searchVersion)
```

Agent version이 달라지면 old extract는 자동 재사용하지 않는다.

## 16.3 Sensitive Data

- Upstage API key: `chrome.storage.session`
- raw user profile: Case local IndexedDB
- Chrome Sync에 개인정보 저장 금지
- 사용자가 Case 삭제 시 raw files, extracted facts, vector store reference, answers 모두 삭제

---

# 17. API Clients

별도 서버는 만들지 않는다.

```text
src/core/upstage/
├── files-client.ts
├── agent-client.ts
├── search-client.ts
├── solar-client.ts
└── schemas.ts
```

native `fetch`를 사용한다.

공통 요구:

- AbortController
- timeout
- exponential backoff
- HTTP status normalize
- Zod validation
- structured error

Job polling은 Side Panel에서 실행한다.

```text
submit
→ 1s
→ 2s
→ 3s
→ 5s 반복(max)
```

과도한 polling 금지.

---

# 18. UI Flow

## 18.1 Contextual Launcher

현재 페이지에서 문서가 발견되면 작고 방해되지 않는 launcher 표시.

```text
이 페이지에서 문서 5개를 찾았습니다.
[UP²STAGE로 펼쳐보기]
```

## 18.2 Side Panel

상태:

1. 발견
2. 문서 선택
3. 분석 동의
4. Processing
5. Overview
6. Quick Action
7. User Profile Form
8. Personalized Result
9. 자유 질문

Overview:

- 주요 요건
- 가장 가까운 실제 마감
- 필수 제출물
- 주의사항
- 다음 행동

Quick Button:

```text
나는 지원할 수 있나요?
```

클릭 즉시 Extract된 Quick Questions를 render한다.

## 18.3 Viewer

answer/evidence 클릭:

```text
Source ID
→ document 선택
→ page/cell 이동
→ highlight
→ 필요하면 Accessible View의 동일 semantic node로 이동
```

---

# 19. Error / Uncertainty Model

사용자에게 `null`과 `unknown`을 섞어 보여주지 않는다.

```text
absent              원문에 없음
unknown             판단에 필요한 정보가 아직 없음
not_applicable      해당 조건이 사용자에게 적용되지 않음
conflict            서로 다른 근거가 충돌
unsupported         현재 renderer/logic이 지원하지 않음
```

Agent/API 실패 시 partial result를 버리지 않는다. Parse 성공 후 Extract 일부 실패면 가능한 문서는 Semantic View/Search에 계속 사용할 수 있어야 한다.

---

# 20. Performance Targets

현재 5문서 Cache MISS Agent baseline: 약 139초.

P0 target:

| 영역 | 목표 |
|---|---:|
| Page attachment discovery | < 1s |
| Side Panel first render | < 300ms |
| Agent 5-document job | 120~150s 범위 유지 |
| Cached Case reopen | < 2s |
| Quick Form open | < 100ms |
| Viewer page change | 체감 < 500ms |
| Evidence jump/highlight | < 100ms after page ready |
| Search + Solar Q&A | 목표 < 8s, 네트워크에 따라 변동 |

Agent를 더 줄이기 위해 Extract quality를 희생하지 않는다.

---

# 21. Security / Privacy

P0 필수:

1. 사용자가 선택한 문서만 업로드
2. 현재 페이지 전체 browsing history 수집 금지
3. 자동 background crawling 금지
4. cookies 사용 금지
5. remote code 실행 금지
6. API key session-only
7. Parse HTML은 DOMPurify 후 render
8. 원본 파일/Case 삭제 UI 제공
9. 외부 Upstage processing을 업로드 전 명시
10. 최소 권한 원칙

---

# 22. Repository Structure

```text
up2stage/
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   ├── sidepanel/
│   ├── viewer/
│   └── options/
├── components/
├── features/
│   ├── discovery/
│   ├── case/
│   ├── processing/
│   ├── guidance/
│   ├── quick-check/
│   ├── qa/
│   ├── viewer/
│   └── accessibility/
├── core/
│   ├── upstage/
│   ├── evidence/
│   ├── retrieval/
│   ├── decision/
│   ├── conflict/
│   ├── storage/
│   └── messaging/
├── renderers/
│   ├── pdf/
│   ├── hwp/
│   ├── xlsx/
│   └── semantic/
├── models/
├── test/
└── wxt.config.ts
```

feature 폴더에서 Upstage API를 직접 호출하지 않는다. 모든 external call은 `core/upstage` adapter를 통과한다.

---

# 23. Dependency List

```text
# Extension / UI
wxt
@wxt-dev/module-react
react
react-dom
typescript
vite

# State / data
zustand
dexie
dexie-react-hooks
zod
@webext-core/messaging

# Viewer
pdfjs-dist
@rhwp/core
@tanstack/react-virtual
SheetJS CE 0.20.3 distribution

# UI
@tailwindcss/vite
tailwindcss
# shadcn components are copied source, not one runtime package

# Security
isomorphic-dompurify 또는 browser-only DOMPurify

# Test
vitest
@testing-library/react
@testing-library/user-event
playwright
@axe-core/playwright
```

DOMPurify는 Extension browser runtime에서만 사용한다면 `dompurify` 자체를 선택하고, Node SSR 호환이 필요 없으므로 `isomorphic-dompurify`는 넣지 않는다.

---

# 24. P0 / P1 Boundary

## P0 — 반드시 구현

- Chrome MV3 Extension
- current page attachment discovery
- user selection/consent
- Upstage Agent v0.22
- Agent include=all normalization
- Overview
- Quick Question immediate form
- deterministic basic eligibility
- SectionChunker
- Upstage Search
- Solar grounded Q&A
- Source Registry
- PDF/HWP/HWPX/XLSX viewer
- source highlight
- Semantic Accessible View
- VoiceOver/keyboard navigation
- IndexedDB cache
- conflict UI 최소 버전

## P1 — 데모 후

- DOCX/PPTX fidelity renderer
- local file:// flow
- background document change detection
- persistent Context Layer
- institutional embed `<up2stage-document-agent />`
- Calendar/Reminder/Siri/App Intents
- local RAG adapter
- cross-device profile

---

# 25. 최종 Architecture Principle

```text
Studio understands the document.
Search narrows the context.
Solar reasons over evidence.
UP²STAGE keeps the place.
```

한국어로는:

> Studio는 문서를 구조화하고, Search는 볼 범위를 좁히고, Solar는 근거 안에서 판단한다. UP²STAGE는 그 판단이 다시 원문으로 돌아갈 수 있게 만든다.

Technical North Star:

```text
Structured
+ Trusted
+ Accessible
= Actionable Document Intelligence
```

이 문서를 UP²STAGE P0의 최종 Technical Spec으로 사용한다.
