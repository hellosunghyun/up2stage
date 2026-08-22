# AGENTS.md — references/upstage/runs

## 적용 범위

`references/upstage/runs` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

실제 Agent 실행 raw 결과와 benchmark history를 보존한다.

## 필수 참고

- `references/upstage/runs/final/README.md`

## 규칙

- raw Job JSON 수정 금지.
- final과 history를 구분한다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
