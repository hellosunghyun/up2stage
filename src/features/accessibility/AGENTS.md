# AGENTS.md — src/features/accessibility

## 적용 범위

이 파일은 `src/features/accessibility` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Accessible View 진입, keyboard, focus synchronization을 담당한다.

## 작업 전 필수 문서

- `docs/04-design/accessibility-view.md`
- `docs/07-testing/accessibility-qa.md`

## 폴더 규칙

- native semantic HTML 우선.
- AI 해석을 원문처럼 읽히게 하지 않는다.
- VoiceOver 수동 QA를 완료한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
