# AGENTS.md — src/renderers

## 적용 범위

이 파일은 `src/renderers` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

포맷별 readonly rendering을 공통 adapter 뒤에 캡슐화한다.

## 작업 전 필수 문서

- `docs/02-architecture/viewer-renderers.md`

## 폴더 규칙

- 편집 기능 추가 금지.
- Decision/Search 로직을 넣지 않는다.
- Source focus contract를 공통 제공한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
