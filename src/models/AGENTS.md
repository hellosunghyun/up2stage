# AGENTS.md — src/models

## 적용 범위

이 파일은 `src/models` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Canonical TypeScript 타입과 enum을 보관한다.

## 작업 전 필수 문서

- `docs/03-data-contracts/canonical-models.md`

## 폴더 규칙

- Raw Upstage type과 canonical type을 분리한다.
- UI 전용 state를 canonical model에 섞지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
