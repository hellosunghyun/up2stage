# ADR-0010: 사용자 UI 명칭을 'Up to Stage'로 변경한다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

ADR-0009에서 Unfold를 `UP²STAGE`로 치환하기로 결정했다. 그러나 사용자 피드백과 발음·검색 흐름에서 `Up to Stage`가 더 친숙하고 기억하기 쉬운 형태라는 판단이 생겼다.

## Decision

- 사용자에게 노출되는 제품명은 `Up to Stage`를 사용한다.
- 코드·패키지·파일명·manifest short_name 등 기술 식별자는 `up2stage`를 그대로 사용한다.
- ADR-0009 'Unfold를 UP²STAGE로 치환한다'는 본 ADR로 대체된다.

## Consequences

- `README.md`, `AGENTS.md`, `docs/00-source-of-truth.md`의 사용자 노출 이름을 갱신한다.
- `wxt.config.ts`의 `manifest.name`과 `action.default_title`은 `Up to Stage`를 사용한다.
- `package.json`의 `name`과 `wxt.config.ts`의 `short_name`은 `up2stage`를 유지한다.
- `references/` 원본 자료는 수정하지 않는다.

## Migration / Validation

- `pnpm lint` 및 `pnpm typecheck`로 설정 파일 문법을 확인한다.
- `wxt.config.ts` 변경 후 `pnpm build`가 정상 동작하는지 확인한다.
