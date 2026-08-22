# AGENTS.md — src/core/decision

## 적용 범위

이 파일은 `src/core/decision` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Quick Question normalization, deterministic evaluator, decision composition, conflict relation을 담당한다.

## 작업 전 필수 문서

- `docs/03-data-contracts/quick-question-decision.md`
- `docs/02-architecture/search-solar.md`

## 폴더 규칙

- unknown과 false를 구분한다.
- 판정 결과마다 기준과 source를 보존한다.
- 문서 역할만으로 source precedence를 임의 결정하지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
