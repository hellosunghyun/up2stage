# AGENTS.md — docs/03-data-contracts

## 적용 범위

`docs/03-data-contracts` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

Canonical model과 외부 API adapter 계약을 관리한다.

## 필수 참고

- `docs/03-data-contracts/canonical-models.md`
- `docs/03-data-contracts/source-evidence-model.md`

## 규칙

- raw Upstage shape와 product model을 구분한다.
- 필드 변경 시 fixture와 migration 영향을 기록한다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
