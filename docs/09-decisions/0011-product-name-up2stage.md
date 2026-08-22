# ADR-0011: 사용자 UI 명칭을 'up2stage'로 통일한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

ADR-0010에서 사용자 노출 이름을 `up to stage`로 변경했으나, 발음과 검색 흐름, 그리고 코드·패키지 식별자와의 일관성을 위해 한 단어 형태의 `up2stage`가 더 단순하고 명확하다는 결론이 났다.

## Decision

- 사용자에게 노출되는 제품명은 `up2stage`로 통일한다.
- 코드·패키지·파일명·manifest short_name 등 기술 식별자는 이미 `up2stage`이므로 그대로 유지한다.
- ADR-0009 'Unfold를 UP²STAGE로 치환한다'와 ADR-0010 '사용자 UI 명칭을 up to stage로 변경한다'는 본 ADR로 대체된다.

## Consequences

- `AGENTS.md`, `docs/00-source-of-truth.md`, `README.md`의 사용자 노출 이름을 `up2stage`로 갱신한다.
- `wxt.config.ts`의 `manifest.name`과 `action.default_title`은 `up2stage`를 사용한다.
- `package.json`의 `name`과 `wxt.config.ts`의 `short_name`은 `up2stage`를 그대로 유지한다.
- `references/` 원본 자료는 수정하지 않는다.

## Migration / Validation

- `pnpm lint` 및 `pnpm typecheck`로 설정 파일 문법을 확인한다.
- `wxt.config.ts` 변경 후 `pnpm build`가 정상 동작하는지 확인한다.
