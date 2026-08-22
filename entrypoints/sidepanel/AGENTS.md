# AGENTS.md — entrypoints/sidepanel

## 적용 범위

이 파일은 `entrypoints/sidepanel` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Side Panel은 Case orchestrator와 제품의 주 UI shell이다.

## 작업 전 필수 문서

- `docs/04-design/side-panel.md`
- `docs/02-architecture/agent-integration.md`
- `docs/03-data-contracts/quick-question-decision.md`

## 폴더 규칙

- API 호출은 core adapter를 통해 수행한다.
- Panel state와 canonical Case state를 분리한다.
- 443px 기준 layout을 유지하되 좁은 폭에 대응한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
