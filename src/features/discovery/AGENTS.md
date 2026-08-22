# AGENTS.md — src/features/discovery

## 적용 범위

이 파일은 `src/features/discovery` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

현재 페이지 attachment 후보를 사용자에게 설명하고 발견 상태를 관리한다.

## 작업 전 필수 문서

- `docs/02-architecture/extension-entrypoints.md`
- `docs/01-product/user-flow.md`

## 폴더 규칙

- 발견과 업로드를 분리한다.
- 중복 URL/filename을 제거한다.
- 지원하지 않는 포맷을 명확히 표시한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
