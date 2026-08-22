# AGENTS.md — docs/04-design

## 적용 범위

`docs/04-design` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

Figma 기반 layout, state, component intent, accessibility 표현을 관리한다.

## 필수 참고

- `docs/04-design/figma-reference.md`
- `docs/04-design/design-tokens.md`

## 규칙

- Figma legacy Unfold를 새 copy로 확산하지 않는다.
- UI 변경은 해당 Figma node와 acceptance를 확인한다.
- Figma에 없는 UI 요소를 임의로 추가하지 않는다.
- Side Panel, Viewer 등 확장 UI는 Figma의 color scheme를 통일해 적용한다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
