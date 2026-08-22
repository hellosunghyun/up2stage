# UP²STAGE Codebase Structure Starter

이 ZIP은 UP²STAGE 개발을 시작하기 위한 **구조·문서·설정 스타터**다.
제품 기능 구현 코드는 의도적으로 포함하지 않았다.

포함 내용:

- WXT / Manifest V3 기본 설정
- 의존성 manifest와 품질 도구 설정
- 구현 폴더 구조
- 루트 및 하위 폴더별 상세 `AGENTS.md`
- 기능별로 분리된 제품·아키텍처·데이터·UI·보안·테스트 문서
- 확정 Upstage Studio Agent v0.22 JSON
- 최종 및 과거 Agent 실행 결과
- Upstage Agents / File Search / Studio 문서 스냅샷
- Figma 노드 맵과 발표 PPTX·발표자 노트
- 관련 기술·접근성·보안 리서치
- Git 커밋 규칙과 권장 기능별 커밋 순서

## 가장 먼저 읽을 것

1. `AGENTS.md`
2. `docs/00-index.md`
3. `docs/00-source-of-truth.md`
4. 구현하려는 폴더의 하위 `AGENTS.md`

## 중요한 상태

- Agent: `UP2STAGE General Document Guidance v0.22` 고정
- P0: 서버 없음, 모든 orchestration은 Chrome Extension에서 수행
- 제품명: UI·발표에서는 `UP²STAGE`, 코드·파일명에서는 `UP2STAGE` / `up2stage`
- Figma와 일부 과거 자료의 `Unfold` 표기는 이전 이름이므로 새 구현에는 사용하지 않는다.
- `references/`는 읽기 전용 개발 자료이며 제품 번들에 포함하지 않는다.

## 시작 절차

```bash
pnpm install
pnpm prepare
```

의존성은 스타터에서 `latest` 태그로 선언되어 있다. 최초 설치 시 생성되는 `pnpm-lock.yaml`을 검토하고 별도 초기 설정 커밋으로 고정한다.

그 뒤 `docs/08-roadmap/commit-plan.md` 순서대로 기능 하나씩 구현한다.

## 커밋 규칙

눈에 띄는 기능 하나가 완성될 때마다 즉시 커밋한다.

```text
feat: 현재 페이지의 첨부문서를 발견

- PDF, HWP, HWPX, XLSX 링크를 DOM에서 수집
- URL과 파일명을 기준으로 중복 후보를 제거
- 사용자가 선택하기 전에는 문서를 외부로 전송하지 않음
```

자세한 규칙은 `docs/05-engineering/git-workflow.md`를 따른다.
