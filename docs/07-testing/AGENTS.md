# AGENTS.md — docs/07-testing

## 적용 범위

`docs/07-testing` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

Unit, integration, E2E, accessibility, demo QA 기준을 관리한다.

## 필수 참고

- `docs/07-testing/test-strategy.md`
- `docs/07-testing/demo-smoke-test.md`

## 규칙

- 테스트는 실제 사용자 불변식과 Source chain을 검증한다.
- fixture provenance를 남긴다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
