# ADR-0013: 사용자 UI 명칭을 'up to stage'로 통일한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

ADR-0011은 사용자 노출 이름을 `up2stage`로 정했으나 Integration Phase의 명시적 제품 결정에서 사용자-facing 제품명을 `up to stage`로 통일하도록 확정했다.

## Decision

- 사용자에게 노출되는 제품명은 소문자 `up to stage`로 통일한다.
- 코드·패키지·환경변수·DB·로그 prefix·파일명 같은 기술 식별자는 `UP2STAGE` 또는 `up2stage`를 유지한다.
- references의 원본 `Unfold`와 과거 발표 자료는 수정하지 않는다.
- ADR-0011의 사용자 UI 명칭 결정은 본 ADR로 대체한다.

## Consequences

- manifest name, action title, HTML title, 이미지 대체 텍스트와 현재 제품 문서는 `up to stage`를 사용한다.
- 기술 식별자와 사용자-facing copy가 의도적으로 구분된다.

## Migration / Validation

- `references/`와 과거 ADR을 제외한 현재 UI·문서에서 legacy 사용자-facing 이름을 검색한다.
- `pnpm check`로 lint, typecheck, test, build를 확인한다.
