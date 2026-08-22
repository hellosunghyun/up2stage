# Contextual Overlay

Overlay는 제품 본체가 아니라 Side Panel 진입을 위한 가벼운 trigger다.

# 10. URL Rule 기반 Contextual Overlay

## 10.1 목표

P0에서는 모든 사이트를 AI로 분석해 "이 페이지가 기회 페이지인가?"를 판단하지 않는다.

고정 Demo URL 또는 명시적인 URL rule을 사용한다.

```ts
export interface ContextRule {
  id: string;
  match(url: URL): boolean;

  label?: string;
  attachmentSelectors?: string[];
}
```

예:

```ts
const rules: ContextRule[] = [
  {
    id: 'demo-scholarship',
    match: (url) =>
      url.hostname === 'example.org' &&
      url.pathname.startsWith('/scholarship/')
  }
];
```

---

## 10.2 Overlay Layout

Overlay는 페이지 UI를 덮는 제품 본체가 아니다.

위치:

```text
position: fixed
right: 24px
bottom: 24px
width: 336px
z-index: 높은 extension overlay layer
```

내용:

```text
◆ UP²STAGE

이 페이지와 관련된 문서를 확인할 수 있어요.
조건, 마감, 제출서류를 함께 정리합니다.

[관련 문서 확인하기 →]    [닫기]
```

행동:

```text
CTA click
→ background message
→ chrome.sidePanel.open()
→ DISCOVERY 상태
```

닫기는 현재 tab/session에서만 suppress해도 된다.

---
