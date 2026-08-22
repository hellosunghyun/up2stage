# AGENTS.md — entrypoints/content

## 적용 범위

이 파일은 `entrypoints/content` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

현재 페이지 URL/DOM을 읽고 URL Overlay와 attachment discovery를 호스트 페이지에 최소 침습적으로 연결한다.

## 작업 전 필수 문서

- `docs/04-design/contextual-overlay.md`
- `docs/06-security/chrome-permissions.md`

## 폴더 규칙

- 호스트 CSS와 충돌하지 않게 Shadow DOM 또는 격리된 root를 사용한다.
- 사용자 선택 전 원문을 외부로 전송하지 않는다.
- 페이지 DOM을 수정하는 범위를 Overlay root로 제한한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
