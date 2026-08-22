# AGENTS.md — src/core/agent

## 적용 범위

이 파일은 `src/core/agent` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Upstage Files/Jobs API와 v0.22 raw output adapter를 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/agent-integration.md`
- `docs/03-data-contracts/agent-output-contract.md`
- `references/upstage/manuals/agents.md`

## 폴더 규칙

- Agent ID/필드명을 추측하지 않고 JSON·fixture로 검증한다.
- `additional_values` string JSON parsing을 한 곳에서 처리한다.
- Agent v0.22 변경 금지.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
