# AGENTS.md — entrypoints/viewer

## 적용 범위

이 파일은 `entrypoints/viewer` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

독립 Viewer Page shell에서 Outline과 Renderer를 조합한다. Guidance와 Evidence interaction은 Chrome Extension Side Panel이 담당한다.

## 작업 전 필수 문서

- `docs/04-design/viewer-layout.md`
- `docs/02-architecture/viewer-renderers.md`
- `docs/03-data-contracts/source-evidence-model.md`

## 폴더 규칙

- 224px + flexible 2-column 구조를 기준으로 한다.
- Viewer 페이지에 Guidance/Evidence 우측 사이드바를 추가하지 않는다.
- Source navigation은 `navigateToSource` 단일 경로를 사용한다.
- 렌더러별 로직을 Viewer shell에 직접 넣지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
