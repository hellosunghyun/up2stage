# ADR-0012: 통합 데이터 저장소를 IndexedDB v2로 확장한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

Phase 3은 Case, Document, Parse, Extract, Guidance와 raw Agent Job을 v1에 저장했다. Phase 5 Source Registry와 Phase 6 Viewer를 실제 Agent 결과에 연결하려면 SourceRecord, Dynamic Quick Question, 원문 파일 bytes를 Extension context 간 공유하고 영속화해야 한다.

## Decision

- 기존 v1 schema를 유지하고 Dexie v2에서 `sources`, `quickQuestions`, `documentFiles`, `userAnswers`, `decisions`, `actionItems` table을 추가한다.
- Viewer는 production runtime에서 fixture가 아니라 `documents`, `sources`, `documentFiles`를 조회한다.
- `agentJobs`는 raw 응답 보존용으로 유지하고, UI는 canonical table을 통해서만 결과를 소비한다.

## Consequences

- 기존 v1 Case와 Agent 결과는 schema upgrade 뒤에도 유지된다.
- 선택 문서 bytes가 IndexedDB에 저장되므로 Viewer가 원본 URL을 다시 내려받지 않아도 된다.
- 원문 파일 저장량은 선택 문서 크기에 비례한다. 이후 cache eviction 정책은 별도 Phase에서 다룬다.

## Migration / Validation

- v1 database를 생성한 뒤 v2로 여는 migration test에서 기존 Case 보존과 신규 table 생성을 검증한다.
- SourceRecord와 document bytes repository round-trip을 unit test로 검증한다.
- `pnpm check`로 lint, typecheck, test, build를 확인한다.
