# AGENTS.md — src/features/processing

## 적용 범위

이 파일은 `src/features/processing` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

장시간 Agent Job을 파일별·단계별 진행 UI로 표현한다.

## 작업 전 필수 문서

- `docs/04-design/side-panel.md`
- `docs/05-engineering/error-retry-resume.md`

## 폴더 규칙

- 가짜 progress를 정확도처럼 표시하지 않는다.
- 재열기 시 Job polling을 resume한다.
- 실패한 문서와 전체 실패를 구분한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
