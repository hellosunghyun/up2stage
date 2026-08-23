# Figma Reference

Canonical URL:

https://www.figma.com/design/5o84w5nHj5TNfxgQTRtY33/jucntionX-Design?node-id=78-2240

## 브랜딩 주의

Figma에는 과거 이름 `Unfold`가 남아 있다. 구현 시 사용자 노출 이름은 `Up to Stage`로 치환한다.
Layout, spacing, component intent는 유지하되 legacy copy를 그대로 복사하지 않는다.

## 주요 노드

| 화면 | Node ID | 기준 |
|---|---:|---|
| API Key Setup | `78:2242` | 최초 연결 / 설정 |
| Discover Documents | `78:2301` | 페이지 문서 발견 |
| Select & Consent | `97:8025` | 443px Side Panel, 24px grid |
| Processing | `147:11606` | 파일별 처리 상태 |
| Initial Guidance | `97:7897` | Result Card, QQ CTA, chips |
| Quick Question Before | `97:7580` | 5개 필드 예시 |
| Quick Question Completed | `97:7306` | 입력 완료 상태 |
| Quick Confirm | `163:2223` | AI 사용 고지 / 확인 |
| Decision Overview | `97:7113` | 상태 chip과 결과 card |
| Document Explore | `163:2338` | 구조/원문/접근성 tab |
| Evidence Explanation | `163:2616` | 선택 source 설명 |
| Viewer + Highlights | `181:3737` | 224 + flexible + 443 layout |

## Design-to-code 규칙

- Figma 연결이 가능하면 해당 node에 `get_design_context`를 사용한다.
- Figma가 반환한 absolute-position React 코드는 참고용이다. 그대로 붙이지 않는다.
- 기존 코드의 component/token/layout pattern에 맞게 재구성한다.
- 이미지·아이콘 asset은 실제 export를 사용하거나 동일 glyph의 기존 component를 사용한다.
- Viewer의 핵심 column 폭과 Side Panel inset은 임의로 바꾸지 않는다.

## 안정적인 오프라인 참고

- `references/design/presentation-with-notes.pptx`
- `references/design/presentation-notes.md`
- `references/design/mockup-side-panel.png`
