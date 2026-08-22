# AGENTS.md — src/features/document-selection

## 적용 범위

이 파일은 `src/features/document-selection` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

문서 선택, 선택 개수, AI 전송 고지, consent를 담당한다.

## 작업 전 필수 문서

- `docs/04-design/side-panel.md`
- `docs/06-security/privacy-security.md`

## 폴더 규칙

- 사용자 선택 전 전송 금지.
- 선택 실패/부분 fetch를 복구할 수 있게 한다.
- CTA는 선택 상태와 동의 상태를 반영한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
