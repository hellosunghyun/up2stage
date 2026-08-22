# AGENTS.md — test/integration

## 적용 범위

이 파일은 `test/integration` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Agent adapter, storage, evidence chain, renderer adapter 경계를 fixture로 검증한다.

## 작업 전 필수 문서

- `docs/07-testing/test-strategy.md`
- `docs/07-testing/fixtures.md`

## 폴더 규칙

- 실제 response shape를 사용한다.
- Source ID chain을 assertion한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
