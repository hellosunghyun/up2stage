# 문서 인덱스

## 작업별 필수 문서

| 작업 | 반드시 읽을 문서 | 원본 참고 |
|---|---|---|
| URL Overlay | `04-design/contextual-overlay.md`, `06-security/chrome-permissions.md` | Figma Discover, PPTX |
| Attachment Discovery | `02-architecture/extension-entrypoints.md`, `01-product/user-flow.md` | Chrome 기술 리서치 |
| Agent API | `02-architecture/agent-integration.md`, `03-data-contracts/agent-output-contract.md` | `references/upstage/manuals/agents.md`, v0.22 JSON, 최종 Job |
| Processing UI | `04-design/side-panel.md`, `05-engineering/error-retry-resume.md` | Figma Processing |
| Initial Guidance | `03-data-contracts/agent-output-contract.md`, `04-design/side-panel.md` | Instruct result/citations |
| Quick Question | `03-data-contracts/quick-question-decision.md`, `04-design/dynamic-quick-question.md` | 최종 Job quick_questions |
| Search / Solar | `02-architecture/search-solar.md`, `03-data-contracts/source-evidence-model.md` | capabilities manual |
| Source Registry | `03-data-contracts/source-evidence-model.md` | Parse/Extract location 실제 응답 |
| Viewer | `02-architecture/viewer-renderers.md`, `04-design/viewer-layout.md` | Figma Viewer nodes |
| Accessible View | `04-design/accessibility-view.md`, `07-testing/accessibility-qa.md` | 접근성 리서치 |
| Storage / Cache | `02-architecture/storage-cache.md`, `03-data-contracts/storage-schema.md` | Technical Spec |
| Permissions / Privacy | `06-security/*` | 보안 리서치 |
| Test | `07-testing/*` | 최종 Job fixture |
| 커밋 | `05-engineering/git-workflow.md`, `08-roadmap/commit-plan.md` | `.gitmessage` |

## 문서 폴더

- `01-product`: 제품 문제, 범위, 사용자 흐름, acceptance
- `02-architecture`: 시스템·Extension·Agent·Search·Viewer·Storage
- `03-data-contracts`: canonical models, Source/Evidence, QQ/Decision
- `04-design`: Side Panel, Viewer, Figma, Overlay, 접근성
- `05-engineering`: 개발·Git·의존성·오류·로그·네이밍
- `06-security`: Manifest, 개인정보, API Key
- `07-testing`: unit/integration/E2E/접근성/데모
- `08-roadmap`: 구현 순서와 P0 cut line
- `09-decisions`: 변경 불변식과 ADR

원본 장문 문서는 `references/source-specs/`에 보관한다.
