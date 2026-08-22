# AGENTS.md — src/core/storage

## 적용 범위

이 파일은 `src/core/storage` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Dexie schema, repository, cache key, migration, resume state를 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/storage-cache.md`
- `docs/03-data-contracts/storage-schema.md`

## 폴더 규칙

- Schema version 변경은 ADR과 migration test가 필요하다.
- API Key를 저장하지 않는다.
- raw reference 파일을 DB seed로 번들하지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
