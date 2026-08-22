# AGENTS.md — src/features/contextual-overlay

## 적용 범위

이 파일은 `src/features/contextual-overlay` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

URL rule 기반 Overlay 표시·닫기·Side Panel 진입을 담당한다.

## 작업 전 필수 문서

- `docs/04-design/contextual-overlay.md`

## 폴더 규칙

- Overlay는 분석을 시작하지 않는다.
- 페이지 본문을 가리지 않는다.
- 호스트 DOM 영향 최소화.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
