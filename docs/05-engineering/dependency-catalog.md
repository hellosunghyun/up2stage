# Dependency Catalog

| Package | 책임 | 사용 위치 |
|---|---|---|
| WXT | MV3 extension entrypoint/build | root/entrypoints |
| React | Side Panel / Viewer UI | entrypoints, features, components |
| Tailwind CSS 4 | UI styling/token utility | styles/components |
| Zod | network/message/storage boundary validation | core |
| Dexie | IndexedDB canonical storage | core/storage |
| Zustand | ephemeral UI state | features/viewer |
| @webext-core/messaging | typed context messaging | core/messaging |
| pdfjs-dist | PDF readonly rendering/text layer | renderers/pdf |
| @rhwp/core | HWP/HWPX readonly rendering | renderers/hwp |
| xlsx | spreadsheet parsing | renderers/xlsx |
| @tanstack/react-virtual | large sheet virtualization | renderers/xlsx |
| DOMPurify | parse HTML sanitization | renderers/semantic |
| Vitest | unit/integration | test |
| Playwright | extension E2E | test/e2e |
| axe-core | accessibility automation | test/e2e |

## 규칙

- 의존성 추가 전 기존 패키지로 해결 가능한지 확인한다.
- renderer용 패키지가 decision/core에 침투하지 않게 한다.
- package 추가/교체는 별도 `chore` 또는 `build` 커밋으로 한다.
- 최초 `pnpm install` 뒤 정확한 버전과 lockfile을 커밋한다.
