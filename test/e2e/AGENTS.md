# AGENTS.md — test/e2e

## 적용 범위

이 파일은 `test/e2e` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Chrome Extension 사용자 흐름과 접근성을 Playwright로 검증한다.

## 작업 전 필수 문서

- `docs/07-testing/demo-smoke-test.md`
- `docs/07-testing/accessibility-qa.md`

## 폴더 규칙

- Demo URL과 fixture mode를 분리.
- Side Panel/Viewer context를 명시적으로 다룬다.
- 실제 API Key를 CI에 노출하지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
