# AGENTS.md — src

## 적용 범위

이 파일은 `src` 아래의 모든 파일에 적용된다. 루트 `AGENTS.md`를 함께 따른다.

## 책임

`src`는 canonical models, core services, feature slices, renderers, components를 포함한다.

## 작업 전 필수 문서

- `docs/02-architecture/system-overview.md`
- `docs/05-engineering/naming-conventions.md`

## 폴더 규칙

- 상위 폴더 간 순환 의존성을 만들지 않는다.
- references 파일을 import하지 않는다.
- 기능 경계를 무시한 shared 폴더 확장을 피한다.

## 완료 기준

- 변경 범위가 이 폴더 책임 안에 있다.
- 관련 unit/integration/E2E 검증을 추가하거나 갱신했다.
- 중요한 사용자 동작 하나가 완성되면 즉시 한국어 상세 본문을 포함해 커밋했다.
