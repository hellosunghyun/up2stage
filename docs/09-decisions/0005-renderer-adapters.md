# ADR-0005: 포맷별 Renderer Adapter를 둔다

- 상태: Accepted
- 날짜: 2026-08-23

PDF는 PDF.js, HWP/HWPX는 @rhwp/core, XLSX는 SheetJS 기반 readonly renderer를 사용한다. Viewer shell과 evidence/accessibility layer는 공통으로 유지한다.
