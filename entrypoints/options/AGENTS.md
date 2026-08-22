# AGENTS.md — entrypoints/options

## 적용 범위

이 파일은 `entrypoints/options` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

API 연결, Cache 삭제, 진단 설정처럼 제품 전역 설정만 담당한다.

## 작업 전 필수 문서

- `docs/06-security/api-key-and-data-handling.md`

## 폴더 규칙

- API Key를 sync storage에 저장하지 않는다.
- 기능 UI를 Options로 옮겨 제품 흐름을 분산시키지 않는다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
