# AGENTS.md — entrypoints/background

## 적용 범위

이 파일은 `entrypoints/background` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Background Service Worker는 action/tab/permission/message event를 라우팅하고 Viewer/Side Panel을 연다.

## 작업 전 필수 문서

- `docs/02-architecture/extension-entrypoints.md`
- `docs/05-engineering/error-retry-resume.md`

## 폴더 규칙

- Agent polling·대형 JSON parsing·rendering 금지.
- Service Worker가 언제든 종료될 수 있음을 전제로 한다.
- 상태는 IndexedDB와 메시지로 복구한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
