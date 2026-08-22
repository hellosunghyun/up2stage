# Design Tokens

Figma에서 확인된 의미 토큰을 코드의 CSS 변수로 유지한다.

```css
--color-bg-inverse: #0a0d14;
--color-bg-inverse-surface: #111722;
--color-brand-lime: #d2ff95;
--color-action-primary: #5b52ff;
--color-text-primary: #0a0d14;
--color-text-on-inverse: #ffffff;
--color-text-inverse-secondary: #8390a5;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

## Figma 출처 확인

- Discover documents (`78:2301`) 조회 시 `--jx-color-bg-canvas: white`, `--jx-color-text-on-inverse: #ffffff`, `--jx-spacing-16: 16px`, `--jx-radius-8: 8px` 등의 변수가 사용됨을 확인
- 현재 토큰과 일치하며, Phase 2 Tailwind/디자인 시스템 적용 시 변수명 매핑 필요

원칙:

- raw hex의 무분별한 반복을 피한다.
- Evidence는 lime translucent, AI Guidance는 dark surface로 구분한다.
- Warning/Conflict는 lime과 동일하게 보이지 않도록 별도 semantic token을 만든다.
- Figma 값 변경 시 token 문서와 UI visual test를 함께 수정한다.
- Side Panel, Viewer 등 확장 UI는 Figma의 color scheme를 통일해 적용한다. 흰색 캔버스와 어두운 surface를 임의로 섞지 않는다.
- Figma에 없는 UI 요소는 사용자나 팀 합의 없이 추가하지 않는다.
