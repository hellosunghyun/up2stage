# ADR-0014: Viewer에서 Guidance 우측 패널을 제거한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

기존 Viewer 설계는 Outline, Document Workspace, 443px Guidance Panel의 3-column 구조였다. 그러나 Guidance, Quick Check, Search/Solar Q&A는 이미 Chrome Extension Side Panel의 Case context에서 제공된다. Viewer에 같은 패널을 다시 만들면 대화 상태와 사용자 경험이 중복된다.

## Decision

Viewer는 224px Outline과 flexible Document Workspace의 2-column 구조를 사용한다.

Guidance, Quick Check, Search/Solar Q&A는 Chrome Extension Side Panel에만 둔다. Side Panel의 근거 클릭은 기존 `navigateToSource` 경로로 Viewer를 열고 정확한 문서와 Source 위치에 집중시킨다.

## Consequences

- Viewer는 원문 렌더링, 구조 탐색, 접근성 보기, Source highlight에 집중한다.
- Viewer가 canonical Guidance를 별도로 로드하거나 표시하지 않는다.
- Extension Side Panel의 Q&A context가 유일한 대화 surface가 된다.
- Guidance와 AI Answer DOM은 Semantic Document DOM과 분리된다.
- Source ID, renderer adapter, Viewer mode, Source Registry 계약은 변경하지 않는다.
- 기존 Figma 3-column Viewer는 이 결정으로 대체되며 후속 디자인 반영이 필요하다.

## Migration / Validation

- `ViewerGuidancePanel`과 Viewer 전용 Guidance adapter 연결을 제거한다.
- E2E에서 Viewer의 `aside`가 Outline 하나뿐인지 확인한다.
- Extension이 생성하는 `case/document/source` URL로 original renderer, outline, Accessible View focus가 연결되는지 확인한다.
- `pnpm check`, `pnpm test:a11y`, Extension Playwright E2E를 실행한다.
