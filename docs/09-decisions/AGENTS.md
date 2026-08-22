# AGENTS.md — docs/09-decisions

## 적용 범위

`docs/09-decisions` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

아키텍처와 제품 불변식 변경을 ADR로 기록한다.

## 필수 참고

- `docs/00-source-of-truth.md`

## 규칙

- 기존 ADR을 소급 수정하지 말고 새 ADR로 대체한다.
- 상태, 날짜, context, consequence를 포함한다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
