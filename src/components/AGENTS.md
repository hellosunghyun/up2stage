# AGENTS.md — src/components

## 적용 범위

이 파일은 `src/components` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

도메인 독립 UI primitive와 공통 표현 컴포넌트를 보관한다.

## 작업 전 필수 문서

- `docs/04-design/design-tokens.md`
- `docs/04-design/figma-reference.md`

## 폴더 규칙

- API 호출·DB 접근 금지.
- absolute Figma code를 그대로 복사하지 않는다.
- 상태는 props와 event로 주입한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
