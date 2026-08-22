# AGENTS.md — test

## 적용 범위

이 파일은 `test` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Unit, integration, E2E, accessibility 검증 구조를 관리한다.

## 작업 전 필수 문서

- `docs/07-testing/test-strategy.md`
- `docs/07-testing/fixtures.md`

## 폴더 규칙

- 실제 raw Job은 read-only.
- Network E2E와 fixture E2E를 구분한다.
- 사용자 흐름 기준으로 테스트 이름을 작성한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
