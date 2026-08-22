# AI Coding Agent 사용법

## 작업 시작 Prompt의 최소 요소

- 구현할 기능 하나
- 읽어야 할 `docs/` 경로
- 수정할 폴더
- acceptance criteria
- 예상 commit message

## Agent가 반드시 수행할 조회

- 루트 + 하위 `AGENTS.md`
- `docs/00-index.md`
- Upstage 작업이면 실제 JSON과 매뉴얼
- UI 작업이면 Figma node context

## 근거 없는 추측 금지

다음은 raw result나 매뉴얼에서 확인한다.

- `additional_values` 구조
- location / coordinates
- output step ordering
- quick question compact format
- Instruct citations
- Search response shape

## 작업 완료 시

- 구현 결과
- 테스트 결과
- 참조 문서
- commit hash
- 아직 검증하지 못한 항목

을 보고한다.
