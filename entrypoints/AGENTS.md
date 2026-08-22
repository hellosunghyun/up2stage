# AGENTS.md — entrypoints

## 적용 범위

이 파일은 `entrypoints` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

WXT entrypoint는 브라우저 context의 진입점과 lifecycle만 담당한다. 비즈니스 로직은 `src/core` 또는 `src/features`로 위임한다.

## 작업 전 필수 문서

- `docs/02-architecture/extension-entrypoints.md`
- `docs/06-security/chrome-permissions.md`

## 폴더 규칙

- entrypoint끼리 전역 state를 공유한다고 가정하지 않는다.
- Message payload는 `src/core/messaging` 계약을 사용한다.
- 오래 걸리는 orchestration은 Background에 넣지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
