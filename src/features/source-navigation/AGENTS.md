# AGENTS.md — src/features/source-navigation

## 적용 범위

이 파일은 `src/features/source-navigation` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Source badge, hover preview, Viewer open, source focus를 담당한다.

## 작업 전 필수 문서

- `docs/03-data-contracts/source-evidence-model.md`
- `docs/04-design/viewer-layout.md`

## 폴더 규칙

- 모든 이동은 sourceId 기반 단일 함수 사용.
- page/coordinate를 UI 컴포넌트에 직접 하드코딩하지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
