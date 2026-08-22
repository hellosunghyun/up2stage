# API Key와 데이터 처리

- API Key는 `chrome.storage.session`에 저장한다.
- `.env`, `chrome.storage.sync`, IndexedDB에 실제 Key를 저장하지 않는다.
- Network error와 로그에 Authorization header를 출력하지 않는다.
- 원본 문서 bytes와 Agent result는 Case 목적에 필요한 기간만 local cache한다.
- 사용자가 Cache 삭제를 요청할 수 있는 Settings 경로를 둔다.
- Quick Question 응답은 해당 Case decision에만 사용한다.
- Search/Solar prompt에는 필요한 조건값과 candidate source만 전달한다.
