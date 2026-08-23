# 시스템 아키텍처

전체 시스템, 기술 스택, 저장소 경계를 정의한다.

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
┌────────────────────── Up to Stage Runtime ──────────────────────┐
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
│ Document Outline | Original Renderer                         │
│                  | Evidence Overlay                          │
│                  | Semantic Layer                            │
└──────────────────────────────────────────────────────────────┘
```

---

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
