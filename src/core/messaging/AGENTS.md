# AGENTS.md — src/core/messaging

## 적용 범위

이 파일은 `src/core/messaging` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Background, Content, Side Panel, Viewer 사이 typed protocol을 정의한다.

## 작업 전 필수 문서

- `docs/02-architecture/extension-entrypoints.md`

## 폴더 규칙

- 모든 payload를 Zod validate한다.
- 대형 원문 bytes를 불필요하게 message로 복제하지 않는다.
- protocol 변경 시 sender/receiver test를 함께 수정한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
