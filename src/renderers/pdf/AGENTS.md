# AGENTS.md — src/renderers/pdf

## 적용 범위

이 파일은 `src/renderers/pdf` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

PDF.js page/text layer와 evidence overlay coordinate를 연결한다.

## 작업 전 필수 문서

- `docs/02-architecture/viewer-renderers.md`
- `docs/04-design/viewer-layout.md`

## 폴더 규칙

- PDF worker path를 빌드 환경에서 검증한다.
- text layer selection을 overlay가 막지 않게 한다.
- zoom 후 highlight transform test를 둔다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
