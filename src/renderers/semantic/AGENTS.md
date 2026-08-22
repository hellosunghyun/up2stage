# AGENTS.md — src/renderers/semantic

## 적용 범위

이 파일은 `src/renderers/semantic` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Parse Element를 안전한 semantic React tree로 렌더한다.

## 작업 전 필수 문서

- `docs/04-design/accessibility-view.md`

## 폴더 규칙

- raw HTML 직접 injection 금지.
- DOMPurify와 자체 mapping 사용.
- heading/table/list semantics test를 둔다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
