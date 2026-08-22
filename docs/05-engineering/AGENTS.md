# AGENTS.md — docs/05-engineering

## 적용 범위

`docs/05-engineering` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

개발 도구, Git, 오류 처리, 로그, 의존성 규칙을 관리한다.

## 필수 참고

- `docs/05-engineering/git-workflow.md`
- `docs/05-engineering/agent-usage.md`

## 규칙

- 커밋 단위를 작게 유지한다.
- 도구 설정 변경은 재현 방법과 검증 명령을 포함한다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
