# AGENTS.md — src/core/search

## 적용 범위

이 파일은 `src/core/search` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

SectionChunker, vector store, File Search adapter와 chunk registry를 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/search-solar.md`
- `references/upstage/manuals/capabilities.md`

## 폴더 규칙

- Search 결과를 Evidence로 승격하지 않는다.
- Search용 summary/H1을 원문으로 취급하지 않는다.
- chunk-source mapping을 보존한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
