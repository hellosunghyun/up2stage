# Contributing

1. 루트 `AGENTS.md`와 작업 폴더의 가장 가까운 `AGENTS.md`를 읽는다.
2. `docs/00-index.md`에서 해당 기능의 필수 문서를 확인한다.
3. 하나의 눈에 보이는 기능을 작은 범위로 구현한다.
4. 관련 lint, typecheck, unit/integration test를 실행한다.
5. 아래 형식으로 즉시 커밋한다.

```text
feat: URL 규칙 기반 공고 오버레이를 표시

- 데모 URL과 일치할 때 우측 하단 오버레이를 표시
- 닫기 상태를 현재 탭 세션 동안 유지
- CTA에서 사이드 패널 열기 메시지를 전송
```

아키텍처·권한·데이터 계약·의존성·Viewer 포맷 지원 범위를 바꾸려면 먼저 ADR을 작성한다.
