# ADR-0006: Canonical state는 Dexie, 임시 UI state는 Zustand를 사용한다

- 상태: Accepted
- 날짜: 2026-08-23

Extension context 간 공유·영속 상태는 IndexedDB에 저장한다. Zustand store 하나를 전체 Extension의 source of truth로 사용하지 않는다.
