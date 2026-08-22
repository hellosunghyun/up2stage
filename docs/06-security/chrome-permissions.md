# Chrome Permission Strategy

기본 권한:

```text
activeTab
scripting
sidePanel
storage
```

기본 host permission:

```text
https://api.upstage.ai/*
```

외부 첨부 origin은 실제로 필요할 때 optional host permission으로 요청한다.

금지:

- 기본 `<all_urls>` 상시 권한
- cookies/history 접근
- 사용자가 선택하지 않은 문서 업로드
- page content를 일반 browsing history로 축적

URL Rule Overlay는 demo host에 한정된 content script match 또는 activeTab injection으로 구현한다.
구현 방식 변경 시 Manifest permission diff를 별도 검토한다.
