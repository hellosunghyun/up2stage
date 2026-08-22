# ADR-0001: P0에서 별도 서버를 사용하지 않는다

- 상태: Accepted
- 날짜: 2026-08-23

## Context

해커톤 Demo 범위에서 배포·운영 복잡도를 최소화하고 Chrome Extension에서 Agent/Search/Solar를 직접 호출한다.

## Decision

Background는 event router, Side Panel은 Case orchestrator로 사용한다. 별도 API server, Cloud DB, account server를 추가하지 않는다.

## Consequences

API Key와 개인정보 보호 UX가 중요하며, 장기 production에서는 별도 보안 architecture가 필요할 수 있다.
