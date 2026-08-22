# AGENTS.md — src/core/evidence

## 적용 범위

이 파일은 `src/core/evidence` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Source ID 생성, Registry, resolver, validator를 담당하는 가장 중요한 불변식 폴더다.

## 작업 전 필수 문서

- `docs/03-data-contracts/source-evidence-model.md`
- `docs/09-decisions/0004-source-registry.md`

## 폴더 규칙

- Source ID는 deterministic해야 한다.
- Evidence 없는 중요 답변을 통과시키지 않는다.
- Search chunk와 SourceRecord를 혼동하지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
