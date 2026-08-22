# AGENTS.md — src/renderers/hwp

## 적용 범위

이 파일은 `src/renderers/hwp` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

@rhwp/core 기반 HWP/HWPX readonly rendering과 fallback을 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/viewer-renderers.md`

## 폴더 규칙

- pixel-perfect editor를 목표로 하지 않는다.
- coordinate drift를 adapter에서 보정한다.
- 실패 시 Semantic View fallback을 제공한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
