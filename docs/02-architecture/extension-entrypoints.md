# Extension Entry Point와 Messaging

Background, Content Script, Side Panel, Viewer의 책임을 분리한다.

# 6. Extension Entry Point 책임

## 6.1 `background.ts`

Background Service Worker는 오래 걸리는 작업을 직접 수행하지 않는다.

책임:

- extension icon click
- side panel open 요청
- tab change event
- content ↔ side panel message routing
- optional host permission 요청
- viewer tab 생성
- runtime event bridge

금지:

- Agent 장시간 polling
- 대형 Parse JSON 처리
- Search Index 생성
- PDF/HWP rendering
- Solar 장기 요청 orchestration

---

## 6.2 `content.ts`

책임:

- 현재 URL 확인
- Contextual Rule match
- Contextual Overlay mount/unmount
- DOM 기반 attachment discovery
- page metadata 수집
- Side Panel에 current page context 전달

---

## 6.3 Side Panel

Side Panel이 Case Orchestrator다.

책임:

- current page context
- discovered document selection
- file download
- Agent Job 시작
- Agent Job polling
- Agent Result normalization
- IndexedDB 저장
- Initial Guidance 화면
- Quick Question / Decision
- Search / Solar Q&A orchestration
- Viewer open

---

## 6.4 Viewer

Viewer는 별도 extension page로 연다.

예:

```text
chrome-extension://<id>/viewer.html?case=<caseId>&document=<documentId>&source=<sourceId>
```

책임:

- 원본 파일 렌더
- 문서 목차
- Evidence Highlight
- Source navigation
- Semantic Accessible View
- 오른쪽 Guidance panel

---

---

# 7. Manifest / Permission

P0 기본 권한:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "https://api.upstage.ai/*"
  ]
}
```

원칙:

- 기본 `<all_urls>` 금지
- cookies 미사용
- browsing history 미사용
- file access는 필요할 때 별도 UX
- 다른 origin의 첨부 파일 접근이 필요한 경우 optional permission으로 요청
- 사용자가 선택하지 않은 문서를 외부로 전송하지 않음

---

---

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

---

# 11. Attachment Discovery

## 11.1 기본 탐색

현재 DOM의 다음 요소를 확인한다.

```text
a[href]
button[data-url]
iframe[src]
embed[src]
object[data]
```

우선 지원 확장자:

```text
.pdf
.hwp
.hwpx
.xlsx
.docx
.pptx
```

P0 Viewer는 PDF/HWP/HWPX/XLSX 중심이지만 Agent 입력 후보는 지원 포맷 전체를 탐색할 수 있다.

`a[href]`가 `#n`, `javascript:void(0)`처럼 실제 파일 URL이 아닌 경우, 링크 텍스트에서 파일명과 확장자를 추론한다.

---

## 11.2 Attachment 후보 모델

```ts
export interface DiscoveredAttachment {
  id: string;
  url: string;
  fileName: string;

  extension?: string;
  label?: string;

  sourceElementText?: string;

  selected: boolean;
  accessible: boolean;
}
```

중복 제거:

```text
canonical URL
+ inferred filename
```

---

---

# 78. Messaging Protocol

예:

```ts
interface Protocol {
  openSidePanel(data: {
    tabId: number;
  }): void;

  currentPageContext(): Promise<PageContext>;

  discoverAttachments(): Promise<DiscoveredAttachment[]>;

  openViewer(data: {
    caseId: string;
    documentId: string;
    sourceId?: string;
  }): void;
}
```

Message payload는 Zod validate.

`@webext-core/messaging`의 `sendMessage`는 Extension Page(예: Side Panel)에서 Content Script로 직접 전달되지 않는다.
Background에서 `chrome.tabs.sendMessage`로 active tab에 전송하고, Content Script에서 `chrome.runtime.onMessage` 직접 listener로 응답해야 한다.

---
