# AGENTS.md — src/features

## 적용 범위

이 파일은 `src/features` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

사용자에게 보이는 vertical feature를 구성한다. API/DB implementation은 core를 사용한다.

## 작업 전 필수 문서

- `docs/01-product/user-flow.md`
- `docs/04-design/side-panel.md`

## 폴더 규칙

- Feature에서 Upstage fetch 금지.
- 다른 feature 내부 파일을 deep import하지 않는다.
- 기능 하나가 완성될 때마다 커밋한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
