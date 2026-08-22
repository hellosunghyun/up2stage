# AGENTS.md — src/features/guidance

## 적용 범위

이 파일은 `src/features/guidance` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Initial Guidance, Result Card, Timeline, Checklist, Caution을 제공한다.

## 작업 전 필수 문서

- `docs/03-data-contracts/agent-output-contract.md`
- `docs/04-design/ui-output-coverage.md`

## 폴더 규칙

- 각 source reference를 보존한다.
- 원문과 AI 요약을 시각적으로 구분한다.
- cached extract를 먼저 사용한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
