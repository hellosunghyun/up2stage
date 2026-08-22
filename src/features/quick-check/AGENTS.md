# AGENTS.md — src/features/quick-check

## 적용 범위

이 파일은 `src/features/quick-check` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Dynamic QQ form, confirm, 조건별 Decision을 담당한다.

## 작업 전 필수 문서

- `docs/04-design/dynamic-quick-question.md`
- `docs/03-data-contracts/quick-question-decision.md`

## 폴더 규칙

- options를 hardcode하지 않는다.
- 중복 질문을 제거한다.
- 필수/선택/미입력을 구분한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
