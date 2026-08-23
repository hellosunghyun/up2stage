# ADR-0014: Viewer 페이지에서 Guidance 사이드바를 제거한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

기존 Viewer는 `224px Outline + Flexible Workspace + 443px Guidance`의 3-column 구조였다. 그러나 Initial Guidance, Quick Check, Evidence 탐색은 이미 Chrome Extension Side Panel이 담당한다. Viewer 페이지에 같은 443px 패널을 다시 표시하면 두 개의 사이드바가 경쟁하고 문서 작업 영역이 좁아진다.

## Decision

Viewer 페이지는 `224px Outline + Flexible Workspace`의 2-column 구조만 사용한다. Guidance, Quick Check, Evidence 목록과 대화 입력은 Chrome Extension Side Panel에만 둔다.

Side Panel의 Source 선택은 기존 `navigateToSource`와 `openViewer` 메시지를 사용해 `case`, `document`, `source` query를 가진 Viewer 탭을 연다. Viewer는 해당 SourceRecord를 원본 renderer, outline, Accessible Semantic View에 동기화한다.

## Consequences

- Viewer 페이지에 Up to Stage Guidance/Evidence 우측 사이드바를 렌더링하지 않는다.
- Viewer workspace 폭이 넓어지고 원본·Semantic Document 탐색에 집중한다.
- Guidance와 AI Answer DOM은 Extension Side Panel에 남아 Source Semantic DOM과 분리된다.
- Viewer 단독 탭에서는 Guidance 요약과 대화 입력을 제공하지 않는다.
- Source ID, renderer adapter, Viewer mode, Source Registry 계약은 변경하지 않는다.

## Migration / Validation

- `ViewerGuidancePanel`과 Viewer 전용 Guidance adapter 연결을 제거한다.
- E2E에서 Viewer의 aside가 Outline 하나뿐인지 확인한다.
- Extension이 생성하는 `case/document/source` URL로 semantic focus가 연결되는지 확인한다.
- `pnpm check`, `pnpm test:a11y`, Extension Playwright E2E를 실행한다.
