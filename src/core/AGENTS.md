# AGENTS.md — src/core

## 적용 범위

이 파일은 `src/core` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

브라우저/UI와 분리된 API adapter, evidence, decision, storage, messaging 계약을 제공한다.

## 작업 전 필수 문서

- `docs/02-architecture/system-overview.md`
- `docs/03-data-contracts/canonical-models.md`

## 폴더 규칙

- React component를 import하지 않는다.
- 외부 입력은 Zod로 검증한다.
- core 간 dependency 방향을 명확히 유지한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
