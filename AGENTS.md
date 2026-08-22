# AGENTS.md

## 1. 적용 범위

이 파일은 저장소 전체에 적용되는 최상위 작업 규칙이다.
하위 폴더에 `AGENTS.md`가 있으면 최상위 규칙에 더해 해당 규칙을 함께 적용한다.
규칙이 충돌하면 더 구체적인 하위 규칙이 우선하지만, 아키텍처·보안·Source Evidence 불변식은 하위에서 완화할 수 없다.

## 2. 프로젝트 정체성

- 사용자 노출 이름: `up2stage`
- 코드·패키지·환경변수·파일명: `UP2STAGE` 또는 `up2stage`
- Figma와 과거 자료의 `Unfold`는 이전 이름이다. 새 사용자 UI에 `Unfold`를 추가하지 않는다.
- 핵심 가치: `Structured · Trusted · Accessible`
- 핵심 불변식: `Every Answer Has a Place.`
- P0는 서버 없이 Chrome Extension에서 모든 통신과 orchestration을 수행한다.

## 3. 작업 전 반드시 할 일

1. `git status`로 현재 변경 상태를 확인한다.
2. 루트 `README.md`, 이 파일, 가장 가까운 하위 `AGENTS.md`를 읽는다.
3. `docs/00-index.md`에서 기능별 필수 문서를 찾는다.
4. 기존 폴더·컴포넌트·타입·테스트 패턴을 확인한다.
5. Upstage 관련 작업이면 기억으로 API를 작성하지 말고 원본 자료를 확인한다.
   - Agent 실행: `references/upstage/manuals/agents.md`
   - Studio Node: `references/upstage/manuals/studio.md`
   - File Search / Solar capability: `references/upstage/manuals/capabilities.md`
   - 실제 계약: `references/upstage/agent/UP2STAGE_General_Document_Guidance_v0.22.json`
   - 실제 응답: `references/upstage/runs/final/job_XHVD4hULc9tFatRSVr7Bgx.json`
6. UI 작업이면 `docs/04-design/figma-reference.md`의 노드 ID를 확인하고, Figma 연결이 가능하면 해당 노드에 `get_design_context`를 사용한다.

## 4. 문서 우선순위

서로 다른 자료가 충돌하면 아래 순서로 판단한다.

1. 루트 및 하위 `AGENTS.md`
2. `docs/00-source-of-truth.md`의 Locked Decision
3. `docs/`의 현재 분할 구현 문서
4. 최종 Agent v0.22 JSON과 최종 Job 결과
5. 최신 Development / Technical / Master 원본 문서
6. Figma 디자인과 발표 PPTX
7. Upstage 공식 문서 스냅샷
8. 기술·사용자·보안 리서치
9. 과거 Agent config / 과거 Job 결과

충돌을 임의로 조정하지 않는다. 해결이 필요한 경우 `docs/09-decisions/`에 ADR을 추가하고 사용자 또는 팀 합의를 받는다.

## 5. 코드 작성 원칙

- TypeScript `strict`를 유지한다.
- Feature 폴더에서 Upstage API를 직접 호출하지 않는다. `src/core/` adapter를 통한다.
- React 컴포넌트에 Agent raw response parsing을 넣지 않는다.
- Source ID는 모델이 생성하지 않는다. Parse 결과에서 deterministic하게 생성한다.
- Search hit 자체를 최종 Evidence로 취급하지 않는다.
- Solar는 Registry에 이미 존재하는 candidate Source ID 중에서만 선택한다.
- 숫자·boolean·날짜·exact membership처럼 코드로 판단 가능한 조건은 deterministic하게 평가한다.
- 원문·AI 해석·사용자 입력을 데이터 모델과 UI에서 구분한다.
- `references/`를 import하거나 제품 bundle에 포함하지 않는다.
- 원문 전체, API Key, 사용자 조건값을 console/log에 남기지 않는다.
- 백엔드, Cloud DB, 별도 인증 서버를 P0에 추가하지 않는다.

## 6. 변경 범위

한 작업은 하나의 눈에 보이는 기능 또는 하나의 명확한 기술 경계를 완성해야 한다.
관련 없는 대규모 리팩터링, 전체 포맷팅, 의존성 일괄 업데이트를 함께 하지 않는다.

다음 변경은 구현 전에 ADR 또는 명시적 확인이 필요하다.

- Agent schema / Agent version
- Manifest permission / host permission
- IndexedDB schema version
- Source ID 형식
- Viewer renderer 교체
- 새로운 외부 서비스
- 서버 도입
- 개인정보 저장 범위
- Figma layout의 핵심 column 구조

## 7. 테스트 원칙

커밋 전에 변경 범위에 맞는 검증을 실행한다.

- 일반 로직: unit test
- Adapter / raw response: fixture integration test
- UI: component test
- Extension flow: Playwright E2E
- Viewer / Source navigation: integration + manual visual check
- 접근성: keyboard, visible focus, axe, VoiceOver 확인

가능한 경우 다음을 실행한다.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

전체 검증이 불가능하면 실행한 것과 실행하지 못한 이유를 커밋 본문 또는 작업 보고에 남긴다.

## 8. 커밋 규칙

사용자가 눈으로 확인할 수 있는 기능 하나가 완성될 때마다 즉시 커밋한다.
여러 기능을 한 커밋에 쌓지 않는다.

필수 형식:

```text
feat: 한국어로 기능을 설명

- 무엇을 구현했는지 상세 설명
- 데이터 흐름 또는 중요한 제약 설명
- 테스트·확인 방법 설명
```

예:

```text
feat: URL 규칙 기반 공고 오버레이를 표시

- 데모 URL 패턴과 일치할 때 우측 하단에 오버레이를 표시
- 닫기 상태를 현재 탭 세션 동안 유지
- CTA 클릭 시 사이드 패널 열기 메시지를 전송
```

허용 type:

- `feat`: 사용자에게 보이는 기능
- `fix`: 오류 수정
- `refactor`: 동작 변화 없는 구조 개선
- `test`: 테스트
- `docs`: 문서
- `perf`: 성능
- `chore`: 설정·도구
- `build`: 빌드·패키징
- `ci`: CI

`git commit --amend`, `rebase`, 강제 push, 기존 커밋 재작성은 요청 없이 수행하지 않는다.

push는 Phase 완료, 긴 턴 종료, 대규모 수정 직후 등 커밋이 의미 있는 단위로 모였을 때 수행한다. 명시적 요청이 없어도 이러한 시점에 `git push`를 실행할 수 있다.

## 9. 완료 보고

작업을 마칠 때 다음을 짧게 남긴다.

- 구현한 기능
- 변경한 주요 파일
- 실행한 테스트
- 남은 위험 또는 POC 필요 범위
- 생성한 커밋 해시와 메시지

## 10. 금지 사항

- 원본 Agent JSON·Job JSON·Upstage 문서 수정
- Figma-generated React 코드를 그대로 복사
- `Unfold` 이름을 새 코드에 확산
- 위치 근거 없는 중요 판단 표시
- Search summary를 원문 quote처럼 표시
- 모든 문서를 하나의 LLM prompt에 통째로 전달
- 사용자 선택 전 문서 전송
- API Key persistent sync 저장
- 기능 여러 개를 한 번에 구현한 뒤 마지막에 한 커밋
