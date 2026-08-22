# AGENTS.md — docs/02-architecture

## 적용 범위

`docs/02-architecture` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

시스템 경계와 dependency direction을 관리한다.

## 필수 참고

- `docs/02-architecture/system-overview.md`
- `docs/00-source-of-truth.md`

## 규칙

- 아키텍처 변경은 ADR이 필요하다.
- 서버 없음, Agent v0.22, Source Registry 결정을 임의 변경하지 않는다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
