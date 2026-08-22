# AGENTS.md — src/features/qa

## 적용 범위

이 파일은 `src/features/qa` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

Suggestion Chip과 자유 질문 Q&A 경험을 담당한다.

## 작업 전 필수 문서

- `docs/02-architecture/search-solar.md`
- `docs/03-data-contracts/source-evidence-model.md`

## 폴더 규칙

- cached output으로 답할 수 있으면 Solar 호출을 피한다.
- 근거 validation 실패 답변을 표시하지 않는다.
- Chat history가 canonical source를 복제하지 않게 한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
