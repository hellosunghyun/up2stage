# AGENTS.md — src/utils

## 적용 범위

이 파일은 `src/utils` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

특정 도메인에 종속되지 않는 작은 pure utility만 보관한다.

## 작업 전 필수 문서

- `docs/05-engineering/naming-conventions.md`

## 폴더 규칙

- 잡다한 공용 폴더로 키우지 않는다.
- feature/core 책임을 숨기는 wrapper 금지.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
