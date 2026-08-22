# Source of Truth

## Locked Decisions

- Agent는 `UP2STAGE General Document Guidance v0.22`를 사용한다.
- P0에는 서버가 없다.
- Chrome Side Panel이 Case Orchestrator다.
- Source ID는 Parse Element에서 Extension이 deterministic하게 만든다.
- Search는 후보 범위를 찾고, 최종 Evidence가 아니다.
- Solar는 candidate Source ID 중에서만 근거를 선택한다.
- Quick Question은 Agent Extract 결과로 미리 생성하고 클릭 후 새 LLM 호출 없이 폼을 연다.
- PDF/HWP(HWPX)/XLSX는 renderer adapter로 분리한다.
- Viewer 기본 layout은 224px Outline + Flexible Workspace + 443px Guidance다.
- 사용자 UI 명칭은 `UP²STAGE`다.

## 변경 절차

위 항목을 바꾸려면:

1. 변경 필요 근거를 수집한다.
2. `09-decisions/`에 ADR 초안을 작성한다.
3. 영향 범위와 migration 계획을 기록한다.
4. 팀 합의 후 관련 문서와 nested `AGENTS.md`를 함께 수정한다.

원본 자료가 충돌하면 루트 `AGENTS.md`의 우선순위를 적용한다.
