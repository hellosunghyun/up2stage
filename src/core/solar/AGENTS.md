# AGENTS.md — src/core/solar

## 적용 범위

이 파일은 `src/core/solar` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Candidate sources 안에서 자유 질문·복합 판단을 수행하는 Solar adapter를 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/search-solar.md`
- `docs/03-data-contracts/source-evidence-model.md`

## 폴더 규칙

- Structured Output을 검증한다.
- Registry에 없는 Source ID를 허용하지 않는다.
- deterministic 조건을 불필요하게 LLM에 맡기지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
