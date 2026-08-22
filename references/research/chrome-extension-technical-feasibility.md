# Chrome Extension 기반 Document Agent "Unfold" 기술 가능성 심층 리서치

**조사 기준일: 2026년 8월 22일, Manifest V3 기준**

핵심 결론부터 말하면, **Unfold의 핵심 제품 가설은 구현 가능합니다.** 다만 구현 경계를 다음처럼 잡아야 합니다.

**일반 웹페이지와 직접 링크된 문서, 인증된 GET 문서, 다운로드 이벤트, 로컬 파일, 자체 Viewer는 높은 수준으로 지원할 수 있습니다. 반면 Chrome 기본 PDF Viewer와 다른 Extension의 Viewer 내부 DOM에 개입하는 방식은 제품 기반으로 삼으면 안 됩니다.** Chrome 기본 PDF Viewer는 Chrome이 제공하는 특권 컴포넌트 Extension과 PDFium plugin으로 구성되어 있으며, 외부 MV3 Extension이 그 내부 DOM, plugin, private API에 접근하도록 설계되어 있지 않습니다. citeturn7view0turn4view1turn7view1

따라서 권장 제품 구조는 다음입니다.

> **"현재 페이지에서 문서 후보를 발견하고, Side Panel에서 분석하되, 정밀한 페이지 제어와 Highlight가 필요한 순간에만 Unfold 자체 Viewer로 전환한다."**

Chrome PDF Viewer 자체에서는 Side Panel, 원본 URL 식별, 원본 URL 재-fetch, `#page`, `#zoom`, 일부 Text Fragment 기반 이동 정도까지만 기대하고, **정확한 bbox Highlight, Overlay, DOM 접근, 접근성 레이어는 Unfold Viewer가 담당하는 것**이 가장 안정적입니다. Chrome PDF Viewer 내부의 URL parameter parser와 PDFium plugin에는 페이지 이동 및 text-fragment highlight 기능이 실제로 존재하지만, 이것은 외부 Extension용 viewer API가 아닙니다. citeturn8view0turn8view1turn23search2

## 가능한 문서 진입점과 브라우저 접근 경계

**A. 가능한 문서 진입점 Matrix**

| 문서 진입점 | 탐지 | Binary 확보 | Side Panel | 문서 내부 제어 | 권장 방식 |
|---|---|---|---|---|---|
| 일반 웹페이지의 첨부파일 | **가능** | **대부분 가능** | 가능 | 원 페이지 DOM 제어 가능 | Content Script + privileged fetch |
| `<a href="file.pdf">` | **매우 쉬움** | GET이면 대부분 가능 | 가능 | 링크 위치 Highlight 가능 | DOM scan |
| HWP/HWPX/DOCX 링크 | **가능** | GET이면 대부분 가능 | 가능 | 자체 Viewer에서 가능 | DOM scan + 자체 Viewer |
| URL 직접 입력 PDF | URL 식별 가능 | **재-fetch 가능할 때 가능** | 가능 | Chrome Viewer 내부 제어 제한 | URL 재-fetch 또는 자체 Viewer |
| 다운로드 후 Chrome으로 연 PDF | 가능 | file access 조건부 | 가능 | 기본 Viewer 내부 제한 | `file://` + 자체 Viewer |
| `file://` 로컬 PDF | 가능 | **사용자 file 권한 필요** | 가능 | 기본 Viewer 내부 제한 | file 권한 + 자체 Viewer |
| Chrome 기본 PDF Viewer | 탭 단위 탐지 가능 | 원본 URL 재-fetch 조건부 | **가능** | **매우 제한적** | Side Panel + URL fragment |
| 다른 Extension HWP Viewer | 탭 URL 정도 가능 | **대체로 불가능** | 가능 | **내부 DOM/Canvas 접근 불가** | 이전 단계 URL 추적 또는 협력 API |
| Unfold 자체 Viewer | **완전 가능** | **완전 가능** | 가능 | **완전 제어 가능** | PDF.js/rhwp/docx-preview |
| 한 페이지의 여러 첨부문서 | **가능** | 개별 resolver 적용 | 가능 | 개별 문서별 상태 관리 | candidate registry |

일반 웹페이지에서는 `chrome.tabs.query()`로 활성 탭을 얻고, `activeTab` 또는 적절한 host permission이 있으면 URL 같은 민감 필드를 읽을 수 있습니다. `"tabs"` permission을 사용하면 URL, title, favicon 같은 민감한 `Tab` 속성을 지속적으로 읽을 수 있지만, 사용자가 직접 Unfold를 실행하는 제품이라면 우선 `activeTab`으로 범위를 축소할 수 있습니다. `activeTab`은 action click, context menu, keyboard shortcut 같은 명시적 사용자 동작 이후 현재 origin에 대한 임시 권한을 부여합니다. citeturn0search2turn2view1

일반 페이지 DOM은 Content Script가 가장 적절합니다. Chrome Content Script는 페이지의 DOM을 공유하면서 JavaScript 실행 세계는 기본적으로 격리되어 있고, `chrome.scripting.executeScript()`를 이용해 특정 frame 또는 모든 frame에 동적으로 주입할 수 있습니다. programmatic injection에는 `activeTab` 또는 해당 페이지에 대한 host permission이 필요합니다. citeturn22search11turn9search0

따라서 사용자가 요구한 현재 탭 정보별 접근 방법은 다음과 같습니다.

| 대상 | 구현 | 주된 제한 |
|---|---|---|
| current tab URL | `chrome.tabs.query({active:true, lastFocusedWindow:true})` | URL 민감 필드는 `activeTab`, host permission 또는 `"tabs"` 필요 |
| DOM | Content Script의 `document` | 보호된 Chrome UI, 다른 Extension 페이지, Chrome PDF 내부는 제외 |
| link | `a[href]`, `area[href]`, 관련 data attribute scan | 런타임에서만 생성되는 URL은 사전 탐지 어려움 |
| button | `button`, `input`, `[role=button]`, form, data attribute | 임의 framework closure의 실제 click handler를 표준 API로 역추적할 수 없음 |
| iframe | `iframe`, `frame`, `embed`, `object` scan + 필요 시 frame별 injection | cross-origin frame은 그 origin 권한 필요 |
| attachment | 여러 신호를 종합해 추론 | HTML에 범용 "attachment" 객체는 없음 |

특히 **button 탐색과 "버튼을 누르면 무슨 파일이 다운로드되는가"는 다른 문제**입니다. DOM에서는 버튼의 텍스트, attributes, form action 등을 읽을 수 있지만 React/Vue/사내 프레임워크의 closure 안에서 URL을 계산하는 arbitrary event listener를 안정적으로 정적 추출하는 공개 Extension API는 없습니다. 필요하면 `MAIN` world script에서 `fetch`, XHR, `window.open`, form submit 등을 instrumentation할 수 있지만, 이 방식은 사이트 구현과 충돌할 수 있으므로 P0 기반 기술보다는 보조 수단으로 두는 것이 맞습니다. Chrome은 Content Script에 isolated world와 `MAIN` world 실행 선택지를 제공합니다. citeturn9search0turn22search11

Cross-origin iframe의 경우 부모 페이지 JavaScript가 iframe DOM을 직접 읽을 수 없다는 웹 보안 원칙은 그대로 적용됩니다. 다만 Extension은 **각 iframe origin에 대한 permission을 가지고 있다면 그 frame에 Content Script를 독립적으로 주입**할 수 있습니다. 즉 parent에서 cross-origin DOM을 뚫는 것이 아니라, iframe 자체의 실행 컨텍스트에 Content Script를 넣는 구조입니다. citeturn9search0

## 첨부파일 발견, 인증 세션, CORS와 Agentic Discovery

**B. 페이지 첨부파일 탐색 Architecture**

Unfold의 문서 탐지는 단일 기법이 아니라 **DOM Discovery + Network Observation + Download Observation + Binary Resolver**를 합쳐야 합니다.

```text
┌──────────────────────── Current Tab ────────────────────────┐
│                                                             │
│  Content Script                                             │
│  ├─ <a href> / download                                     │
│  ├─ iframe / embed / object                                 │
│  ├─ form / button / data-*                                  │
│  ├─ Blob URL                                                │
│  └─ MutationObserver                                        │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┘
            ▼
   Document Candidate Registry
   ├─ URL
   ├─ filename / extension
   ├─ MIME hint
   ├─ frameId
   ├─ source element
   ├─ discovery method
   ├─ authentication scope
   └─ confidence
            │
      ┌─────┴─────────┐
      ▼               ▼
 Network Observer    Downloads Observer
 chrome.webRequest   chrome.downloads
      │               │
      └──────┬────────┘
             ▼
       Binary Resolver
       ├─ Extension fetch
       ├─ page-context Blob fetch
       ├─ local file
       └─ native download metadata
             │
             ▼
       Unfold Viewer / Agent
```

`chrome.webRequest`는 MV3에서도 **관찰 용도**로 사용할 수 있습니다. `onBeforeRequest`에서는 request body를 요청할 수 있고, `onHeadersReceived`에서는 response headers를 관찰할 수 있으므로 `Content-Disposition`, `Content-Type`, redirect chain, POST body 같은 신호를 추적할 수 있습니다. 다만 일반 Web Store MV3 Extension은 예전처럼 `webRequestBlocking`을 자유롭게 사용하는 구조가 아니며, Unfold의 목적에는 요청 수정보다 관찰만으로 충분합니다. 또한 `webRequest`는 **response body 자체를 Extension에 제공하지 않습니다.** citeturn12view0

`chrome.downloads`는 실제 Chrome download가 시작됐을 때 매우 강한 signal입니다. `DownloadItem`에는 원래 URL, 최종 URL, referrer, MIME, filename, fileSize 등이 있으며 `onCreated`, `onChanged`로 추적할 수 있습니다. 반면 downloads API 자체에는 다운로드된 파일의 byte array를 읽는 API가 없으므로, **"다운로드를 발견했다"와 "그 파일을 분석할 binary를 얻었다"는 별도 문제**입니다. citeturn11search0

각 형태별 실질 지원 범위는 다음과 같습니다.

| 형태 | 탐지 | Binary 확보 | 핵심 제한 |
|---|---|---|---|
| `<a href="file.pdf">` | **높음** | **높음** | auth, signed URL 정도 |
| `Content-Disposition` | **높음** | 조건부 | `webRequest`는 body를 주지 않음 |
| JavaScript download handler | 실행 후 **높음** | 조건부 | 클릭 전에 URL을 아는 것은 보장 못 함 |
| Blob URL | **높음** | 같은 생성 origin/frame이면 가능 | 다른 frame 또는 closure 내부 blob은 어려움 |
| authenticated GET | **높음** | **높음** | 쿠키 외 bearer token, CSRF 특수 조건 |
| POST 다운로드 | **높음** | **중간 이하** | exact replay가 어려움 |
| iframe 문서 | **높음** | 일반 HTTP면 높음 | PDF MIME handler 또는 타 Extension 내부 제한 |
| viewer 내부 문서 | viewer 종류에 따라 다름 | 자체 Viewer 외에는 낮음 | 보호된 extension context |

`<a href>`는 가장 단순합니다. anchor의 `href`, `download`, `type`, visible text와 filename extension을 조합하고 URL을 absolute URL로 normalize하면 됩니다. 페이지가 SPA라면 `MutationObserver`로 후속 삽입 링크까지 반영하는 구조가 현실적입니다. Content Script는 해당 DOM을 직접 읽을 수 있습니다. citeturn22search11

`Content-Disposition: attachment`는 DOM만으로는 알 수 없으므로 `webRequest.onHeadersReceived`가 효과적입니다. MIME이 `application/pdf`이거나 header filename이 `.hwp`, `.hwpx`, `.docx`이면 문서 후보로 등록할 수 있습니다. 이 방식은 단순 URL suffix가 없는 `/download?id=1234` 같은 endpoint에 특히 유용합니다. `webRequest`로 요청을 보기 위해서는 `webRequest` permission 및 대상 URL에 대한 host access가 필요하며, subresource 요청에서는 initiator 쪽 권한도 영향을 줍니다. citeturn12view0

JavaScript handler가 `fetch`, XHR, navigation, form POST 또는 실제 Chrome download를 일으킨다면 **요청이 발생한 이후**에는 `webRequest` 또는 `downloads`가 이를 포착할 수 있습니다. 반면 버튼을 클릭하기 전 arbitrary JS가 앞으로 어떤 URL을 계산할지 알아내는 것은 일반적으로 보장할 수 없습니다. 따라서 Unfold가 사이트 JS를 깊게 monkey patch하는 것보다 **passive network observation을 1순위로 두는 것이 안전합니다.** citeturn12view0turn11search0

Blob URL은 DOM에서 `blob:` URL이 노출돼 있다면 후보로 식별할 수 있습니다. Chrome의 Content Script network request는 웹페이지 origin의 요청으로 취급되므로 blob을 만든 같은 origin/frame 컨텍스트에서 `fetch(blobUrl)`하여 `ArrayBuffer`로 변환하는 구조를 사용할 수 있습니다. 다른 origin iframe에서 생성된 blob이라면 그 frame에 독립적으로 script를 주입할 권한이 필요합니다. Content Script의 network request는 Extension service worker와 달리 page-origin CORS 규칙을 따릅니다. citeturn2view0turn9search0

POST 다운로드는 난도가 크게 올라갑니다. `webRequest.onBeforeRequest`로 request body를 관찰할 수 있고 `chrome.downloads.download()` 자체도 GET과 POST, body, 일부 custom headers를 지원하지만, 기존 요청의 exact cookie/token/header 상태, CSRF parameter, dynamically generated token 등을 완벽히 재현할 수 있다는 보장은 없습니다. 이미 실행된 POST response의 body를 `webRequest`에서 꺼낼 수도 없습니다. 따라서 **POST로 만들어진 PDF/HWP를 "현재 Viewer에 보이는 원본과 동일한 bytes로 다시 획득한다"는 가정은 위험합니다.** citeturn12view0turn11search0

### 로그인 세션을 유지한 fetch

여기서 가장 중요한 구분은 **`cookies` permission과 "쿠키를 네트워크 요청에 보내는 것"은 같은 기능이 아니라는 것**입니다.

| 수단 | 역할 | 권장도 |
|---|---|---|
| `host_permissions` | Extension origin에서 대상 host로 privileged fetch | **필수에 가까움** |
| `fetch(..., credentials:"include")` | 브라우저 cookie jar를 요청에 사용 | **주된 binary 획득 경로** |
| `cookies` permission | cookie 값을 직접 읽고 수정 | **P0에서는 피할 것** |
| Content Script fetch | 웹페이지 origin의 fetch | CORS가 허용될 때만 |
| Service Worker fetch | extension-origin privileged fetch | URL resolver에 적합 |
| Viewer/Side Panel fetch | extension-origin privileged fetch | 장시간 binary 처리에 더 적합 |
| `chrome.downloads` | native download 시작/관찰 | download detection에 적합 |

Extension page 또는 service worker에서 cross-origin 요청을 할 때 대상 origin에 대한 host permission이 있으면 웹페이지 Content Script와 달리 cross-origin fetch 권한을 얻습니다. Chrome 공식 문서도 cross-origin 요청은 Content Script가 아니라 Extension context에서 수행하도록 설명합니다. citeturn2view0

Chrome은 host permission을 가진 Extension의 third-party network request를 cookie 관점에서 same-site로 취급하는 특별 동작도 설명하고 있으며, 이 경우 SameSite=Strict cookie도 network request에 포함될 수 있습니다. 다만 사용자의 third-party cookie 설정 등은 여전히 영향을 줄 수 있습니다. 따라서 인증 GET의 기본 전략은 **Extension context에서 `credentials: "include"`로 fetch**하는 것입니다. citeturn22search0

`chrome.cookies` API는 이 과정에 필수가 아닙니다. 해당 API는 쿠키를 **직접 조회, 설정, 삭제**해야 할 때 사용하며 `"cookies"` permission과 대상 host permission이 모두 필요합니다. 단순히 로그인 세션이 실린 HTTP 요청을 보내기 위해 쿠키 값을 Extension이 직접 읽을 이유가 없다면 이 권한을 요청하지 않는 편이 보안과 Web Store 심사 양쪽에서 유리합니다. citeturn22search4turn15search2

`chrome.downloads.download()`는 HTTP(S) 요청에서 해당 hostname에 설정된 쿠키를 포함하는 동작을 공식 문서에서 명시하고 있습니다. 따라서 "브라우저가 다운로드하도록 한다"는 목적에는 강하지만, 다운로드 결과 binary를 Extension 메모리로 넘겨주는 API는 아니라는 것이 한계입니다. citeturn11search0

쿠키 기반 인증이 아닌 `Authorization: Bearer ...`를 페이지 JavaScript가 매번 생성하거나, JS memory 안의 CSRF token을 request header에 넣는 애플리케이션에서는 Extension의 별도 fetch가 동일 인증 상태를 자동 재현하지 못할 수 있습니다. 이런 사이트까지 지원하려면 actual request metadata를 관찰하거나 사이트별 adapter가 필요하며, P0 범위로 잡지 않는 것이 좋습니다. `webRequest`가 request headers와 body 일부를 관찰할 수 있지만, 민감 header에는 별도 제한이 존재합니다. citeturn12view0

### CORS와 host_permissions의 실제 경계

**Content Script fetch**
는 페이지를 대신해 요청하므로 일반 웹페이지와 같은 same-origin/CORS 제약을 받습니다. Extension에 host permission이 있다고 해서 Content Script fetch가 CORS를 우회하지 않습니다. citeturn2view0

**Service Worker, Side Panel, Unfold Viewer 같은 Extension page의 fetch**
는 target origin이 `host_permissions`에 들어 있으면 cross-origin 요청이 가능합니다. 이 경우 대상 서버가 일반 웹 CORS용 `Access-Control-Allow-Origin`을 Unfold Extension에 열지 않았더라도 Extension network 권한으로 요청할 수 있습니다. Chrome 문서는 host permission을 이용한 cross-origin request를 명시적으로 지원합니다. citeturn2view0

따라서 **"첨부파일 서버가 CORS를 열어주지 않아서 서버 proxy가 필수"는 Chrome Extension에서는 일반적으로 틀린 가정**입니다. host permission을 받은 Extension context가 직접 요청하면 됩니다. citeturn2view0

서버 proxy가 필요한 상황은 오히려 다음처럼 브라우저 밖의 조건이 있는 경우입니다. 예를 들어 서버 전용 OAuth credential이 필요한 경우, target이 Extension origin 요청 자체를 정책적으로 거부하는 경우, 브라우저가 보유하지 않은 네트워크 인증이 필요한 경우입니다. 다만 proxy에는 사용자의 Chrome login session이 자동 전달되지 않기 때문에 cookie/token을 별도로 보내야 하고, 이는 **"문서가 사용자 브라우저 밖으로 나가지 않는다"는 Unfold의 제품 약속을 약화시킵니다.** 이 때문에 proxy는 문서 획득 기본 경로로 두지 않는 것이 맞습니다. Chrome Web Store 정책 역시 user data 사용과 전송 범위를 명확히 공개하고 single purpose에 필요한 범위로 제한하도록 요구합니다. citeturn15search8turn15search22

### Agentic Link Discovery

한 단계 link discovery 자체는 기술적으로 문제가 없습니다. Content Script가 현재 페이지의 links를 수집하고, 동일 origin의 GET 후보를 식별한 뒤 문서 확장자, MIME, `Content-Disposition` 등을 기준으로 후보를 좁힐 수 있습니다. Cross-origin 후보를 실제 fetch하려면 그 target origin에 대한 host permission을 추가로 받아야 합니다. citeturn2view0turn15search11

Unfold에서는 **"링크 발견"과 "링크 fetch"를 분리**하는 것이 좋습니다. URL을 발견하는 것까지는 현재 페이지에 대한 `activeTab`으로 하고, 다른 origin의 파일을 실제 읽으려 할 때만 `optional_host_permissions`를 요청하는 방식이 Chrome Web Store의 최소 권한 정책과 잘 맞습니다. Chrome은 required와 optional permission 모두 현재 구현 기능에 필요한 가장 좁은 범위만 요청하도록 요구합니다. citeturn15search11turn15search2

`robots.txt`는 브라우저가 Extension 요청을 차단하는 보안 장치가 아닙니다. RFC 9309는 robots 규칙을 crawler가 따라야 하는 프로토콜로 정의하면서 동시에 **access authorization 수단은 아니라고 명시**합니다. 따라서 사용자가 현재 페이지에서 "첨부문서를 찾아줘"라고 실행하는 one-hop fetch에는 Chrome 차원의 robots 강제 제한이 없습니다. 다만 Unfold가 사용자 동작과 무관하게 여러 단계의 링크를 자동 순회하는 crawler로 발전한다면 robots 정책을 존중하는 쪽이 제품과 운영 리스크를 줄입니다. citeturn22search3

## Chrome 기본 PDF Viewer와 로컬 PDF

**C. Chrome PDF Viewer 지원 가능 범위**

이 부분은 Unfold 아키텍처에서 가장 중요한 기술 경계입니다.

현재 Chromium의 built-in PDF Viewer는 일반 웹페이지가 아닙니다. Chromium 소스상 PDF viewer는 내부 component extension이며 ID는 `mhjfbmdgcfjbbpaeojofohoefgiehjai`입니다. 내부 manifest는 `application/pdf` MIME handler와 Chrome 전용 `pdfViewerPrivate` 같은 privileged API를 사용합니다. 이 component extension은 Chrome 자체 구성요소이므로 Web Store Extension의 MV3 제약과 같은 조건으로 보면 안 됩니다. **Unfold가 MV3라고 해서 이 private permission을 사용할 수 있는 것은 아닙니다.** citeturn7view0

내부 구조를 단순화하면 다음과 같습니다.

```text
PDF URL tab
   │
   ▼
Chrome MimeHandlerView
   │
   ▼
Built-in PDF Extension Frame
chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/...
   │
   ├─ PDF Viewer UI
   ├─ Viewport / Toolbar
   └─ internal plugin wrapper
           │
           ▼
       PDF Web Plugin
           │
           ▼
         PDFium
```

Chromium 코드에서 viewer는 `chrome.pdfViewerPrivate.getStreamInfo()` 또는 내부 MIME handler API를 통해 `originalUrl`, `streamUrl`, response headers, tab id 등을 받습니다. viewer와 PDF plugin 간에는 내부 message channel이 사용됩니다. 이 정보와 통신 채널은 **공개 Extension API가 아닙니다.** citeturn4view1turn4view2

더 결정적인 제한은 PDF 내부 scripting API입니다. Chromium의 PDF scripting bridge는 message origin을 확인하며 built-in PDF extension origin 또는 `chrome://print` 같은 허용된 origin에 한정합니다. 따라서 Unfold가 `postMessage`를 보내 Chrome PDF Viewer의 internal command API를 이용하는 방식도 지원되는 통합 경로가 아닙니다. citeturn7view1

Chrome은 최근 Chromium 코드에서도 privileged content에 다른 Extension의 Content Script를 전달하지 않는 방어를 강화하고 있습니다. 일반 match pattern도 `http`, `https`, `file` 등의 지원 scheme을 대상으로 하며 arbitrary `chrome-extension://other-id/...`를 host permission으로 선언하는 구조가 아닙니다. citeturn15search17turn9search1

따라서 요구 기능별 판단은 다음과 같습니다.

| Chrome PDF 기능 | 가능성 | 판단 |
|---|---:|---|
| Extension Side Panel 사용 | **높음** | 가능 |
| 현재 PDF URL 확인 | **높음** | 가능 |
| PDF binary 획득 | **중간~높음** | URL 재-fetch 가능한 경우 |
| 특정 페이지 이동 | **높음** | URL fragment 사용 |
| 페이지 번호 직접 읽기 | **낮음** | 공개 viewer state API 없음 |
| 특정 좌표 이동 | **중간** | PDF open parameter로 제한적 |
| 텍스트 Highlight | **중간** | Text Fragment best-effort |
| arbitrary bbox Highlight | **불가에 가까움** | 공개 API 없음 |
| Viewer DOM 접근 | **불가** | protected internal extension frame |
| Viewer 위 DOM Overlay | **불가** | injection이 안 됨 |
| Content Script 주입 | **불가** | protected extension content |
| custom accessibility layer | **불가** | 내부 DOM 수정 불가 |
| viewer internal binary stream 획득 | **불가** | `pdfViewerPrivate` 전용 |

### Side Panel

Side Panel은 웹페이지 DOM 안에 삽입되는 UI가 아니라 Chrome이 Extension에 제공하는 별도의 browser UI입니다. `chrome.sidePanel.setOptions({tabId, ...})`로 특정 tab별 panel을 설정할 수 있고, 사용자 동작에 응답하여 `sidePanel.open({tabId})`도 사용할 수 있습니다. 따라서 PDF Viewer 내부에 Content Script를 삽입하지 못하는 것과 Side Panel을 여는 것은 별개 문제입니다. 공식 API 구조상 **PDF 탭에서도 Side Panel을 쓰는 접근은 유효합니다.** PDF 탭만을 별도로 금지하는 공식 API 제약은 확인되지 않았습니다. citeturn0search0

이 항목은 POC에서 실제 Stable Chrome의 full-page PDF, embedded PDF, `file://` PDF 세 가지로 한번 더 검증해야 하지만 기술적으로는 **high-confidence**입니다.

### 현재 PDF URL

현재 tab의 URL은 `chrome.tabs.query()`로 얻을 수 있습니다. full-page PDF의 내부 component frame까지 파고들 필요 없이 **사용자가 연 원래 PDF URL을 tab 정보에서 사용**하는 것이 맞습니다. Chromium PDF viewer 내부도 별도로 `originalUrl`과 tab URL을 관리합니다. citeturn0search2turn4view1

### PDF binary

여기서 중요한 것은 **Viewer에서 bytes를 빼내는 것이 아니라 original URL을 다시 fetch하는 것**입니다.

```js
const response = await fetch(pdfUrl, {
  credentials: "include",
});

if (!response.ok) {
  throw new Error(`PDF fetch failed: ${response.status}`);
}

const pdfBytes = await response.arrayBuffer();
```

이 코드는 service worker나 Unfold Viewer 같은 Extension context에서 target host permission을 가지고 실행하는 것을 전제로 합니다. Extension context의 cross-origin fetch에는 host permission을 사용할 수 있고 cookie session을 포함시킬 수 있습니다. citeturn2view0turn22search0

하지만 현재 Chrome PDF Viewer에 이미 로드된 내부 `streamUrl` 또는 PDFium의 bytes를 Unfold가 직접 가져오는 공개 API는 없습니다. 그 기능은 internal `pdfViewerPrivate`와 plugin protocol 안에 있습니다. 따라서 **POST 생성 PDF, single-use signed URL, 이미 소진된 temporary URL처럼 재-fetch가 불가능한 PDF는 Chrome Viewer에서 사후 복구하지 못할 수 있습니다.** citeturn4view1turn7view2

이것은 Unfold에서 매우 중요한 위험 가정입니다.

### 페이지 이동

Chromium PDF viewer는 PDF open parameters를 실제로 parse합니다. 지원 코드에는 `#page=`, zoom/position, named destination 등이 있으며 같은 PDF URL의 fragment navigation은 viewer 내부에서 처리됩니다. citeturn8view0turn8view1

따라서 Unfold는 Viewer DOM을 만지는 대신 다음 식으로 tab URL을 변경할 수 있습니다.

```text
document.pdf#page=17
```

또는 viewer가 지원하는 zoom/position parameter를 이용해 viewport 위치를 지정하는 방법이 있습니다. Chromium parser에는 scale, left, top 형태의 zoom parameter 처리 코드가 존재합니다. citeturn8view0

다만 이것을 **"PDF Viewer의 정식 Extension navigation API"로 보면 안 됩니다.** PDF URL open-parameter 기반 제어이므로 정밀 bbox anchoring보다는 페이지 또는 대략적 위치 이동에 적합합니다.

또 하나의 한계는 **현재 사용자가 스크롤하여 보고 있는 페이지를 외부 Extension이 실시간으로 읽을 공개 API가 없다는 점**입니다. Unfold가 자신이 실행한 `#page=17` 명령은 기억할 수 있지만, 사용자가 viewer에서 직접 scroll한 현재 page를 semantic state로 가져오는 것은 별도 문제입니다.

### Highlight

Chromium의 current PDF plugin 소스에는 `HandleHighlightTextFragmentsMessage()`가 있고, 실제 PDF engine의 `FindAndHighlightTextFragments()`와 첫 match로 scroll하는 코드가 존재합니다. PDF open-parameter parser도 Text Fragment directive를 처리합니다. 즉 **Chrome PDF Viewer 자체가 text-fragment 기반 PDF text highlighting을 지원하는 내부 경로는 존재합니다.** citeturn23search2turn8view0

따라서 외부에서 사용할 수 있는 현실적인 편법은 다음 형태의 URL-level Text Fragment입니다.

```text
document.pdf#:~:text=검색할텍스트
```

다만 이것은 **텍스트 string 기반 best-effort highlight**입니다. 동일 문구가 여러 번 등장하거나 PDF text extraction 순서가 이상한 경우 정확한 영역을 보장할 수 없으며, 특정 `(x, y, width, height)` bbox에 overlay를 그리는 API도 아닙니다. 정밀 Agent citation UX의 기반으로는 부족합니다. citeturn23search2

### Viewer DOM, Overlay, Accessibility

**Viewer DOM 접근, Content Script 주입, PDF canvas/plugin 위 arbitrary HTML overlay는 제품적으로 불가능하다고 보는 것이 맞습니다.**

다른 Extension이 다른 Extension의 내부 페이지를 일반 host permission으로 소유할 수 없고, Chromium은 privileged renderer에 Content Script가 주입되지 않도록 방어합니다. 또한 `webRequest`조차 다른 Extension의 `chrome-extension://other-id/...` 요청을 숨기는 보안 경계가 있습니다. citeturn15search17turn12view0

따라서 Chrome PDF Viewer의 DOM에 `<div class="unfold-highlight">`를 올리거나, accessibility tree용 node를 삽입하거나, PDF plugin의 text selection 정보를 읽는 구조를 설계하면 안 됩니다.

단, `activeTab`을 가진 상태에서 `tabs.captureVisibleTab()`을 사용하면 민감한 화면 영역이나 다른 Extension 페이지까지 screenshot을 얻을 수 있는 특별 권한 경로가 있습니다. 이것은 **화면 이미지 fallback**이지 PDF의 DOM, Canvas object, text layer 또는 binary 접근은 아닙니다. citeturn0search2

**E. 자체 Viewer가 필요한 조건은 명확합니다.**

다음 중 하나라도 필요하면 Chrome PDF Viewer가 아니라 Unfold Viewer로 전환해야 합니다.

**정확한 bbox citation**, **영역 Highlight**, **Agent와 현재 page/selection 양방향 sync**, **annotation**, **접근성 layer 확장**, **문서 구조 추출과 rendering 위치를 동일 coordinate system으로 유지**, **다른 파일 형식과 일관된 UX**가 해당합니다.

### 로컬 PDF

`file://`는 일반 HTTP host permission과 다른 사용자 승인 단계가 있습니다. Chrome match pattern은 `file` scheme을 지원하지만, 사용자가 Extension 관리 화면에서 **"Allow access to File URLs"**를 허용해야 합니다. Extension은 `chrome.extension.isAllowedFileSchemeAccess()`로 현재 허용 상태를 확인할 수 있습니다. citeturn9search1turn9search3

따라서 로컬 PDF의 조건은 다음과 같이 보는 것이 안전합니다.

| 기능 | 조건 |
|---|---|
| Unfold action/Side Panel | 가능 |
| `file://` URL 식별 | 가능 |
| 해당 file에 대한 Extension network access | `file:///*` + 사용자 file access 허용 |
| Chrome PDF Viewer DOM 접근 | 여전히 불가 |
| binary fetch | file scheme permission 전제, **POC 검증 필수** |
| 완전한 분석 | binary를 확보하면 가능 |

Chrome 공식 문서는 file scheme access 자체와 사용자 toggle을 명확히 문서화하지만, **"현재 Chrome built-in PDF tab의 file URL을 모든 환경에서 service worker `fetch()`로 반드시 읽을 수 있다"는 PDF-specific 보장은 별도로 명시하지 않습니다.** 따라서 이 부분은 2시간 POC에서 반드시 실측해야 합니다. 실패 시 확실한 fallback은 Unfold Viewer에서 사용자가 File Picker 또는 drag-and-drop으로 해당 파일을 다시 여는 것입니다. citeturn9search1turn9search3

`activeTab`은 이 file access toggle을 우회하는 기능으로 보면 안 됩니다. file URL 지원에는 사용자가 별도로 제어하는 scheme access가 존재합니다. citeturn9search3

## 다른 HWP Extension과 자체 Viewer 선택

**D. 다른 HWP Viewer Extension 지원 가능 범위**

사용자가 다음 페이지를 보고 있다고 가정하겠습니다.

```text
chrome-extension://OTHER_EXTENSION_ID/viewer.html
```

Unfold 관점의 권한 경계는 강합니다.

| 작업 | 가능성 | 설명 |
|---|---:|---|
| tab URL 확인 | **가능** | `"tabs"` 등 URL 읽기 권한이 있으면 가능 |
| 그 페이지에 Content Script 주입 | **불가** | 다른 Extension origin은 일반 host 대상이 아님 |
| DOM 읽기 | **불가** | injection 불가 |
| Canvas element 접근 | **불가** | DOM 접근 자체가 불가 |
| Canvas의 화면을 screenshot | **조건부 가능** | `activeTab` + `captureVisibleTab` |
| viewer JS state 읽기 | **불가** | extension isolation |
| 원본 URL이 tab query/hash에 노출된 경우 | **가능** | tab URL 문자열에서 얻을 수 있음 |
| 내부 state에만 있는 original URL | **불가** | 접근 불가 |
| 다른 Extension resource 읽기 | **기본 불가** | target이 web-accessible로 명시한 것만 |
| extension간 messaging | **상대방 협력 시 가능** | 공개 listener/API 필요 |
| 원본 HWP binary 읽기 | **기본 불가** | 상대방 공개 API 또는 사전 확보 필요 |

Chrome Extension의 resources는 기본적으로 외부에 공개되지 않습니다. `web_accessible_resources`를 통해 target Extension이 특정 resources와 접근 가능한 origin 또는 extension IDs를 명시적으로 노출해야 외부에서 접근할 수 있습니다. citeturn22search2

Extension 간 message passing 자체는 Chrome이 지원합니다. 하지만 receiving Extension이 `onMessageExternal`/`onConnectExternal` 같은 통신 경로를 구현하고 허용해야 합니다. **Unfold가 일방적으로 임의 HWP Viewer의 runtime state를 읽는 API는 아닙니다.** citeturn10search14

또한 Chrome `webRequest` 문서는 한 Extension이 **다른 Extension이 소유한 `chrome-extension://` 요청을 볼 수 없도록 숨긴다**고 명시합니다. 따라서 "HWP Viewer Extension이 내부적으로 원본 파일을 fetch할 테니 그 network request를 Unfold webRequest로 훔쳐보자"라는 구조도 성립하지 않습니다. citeturn12view0

가능한 예외는 **Viewer에 들어가기 전 단계**입니다. 다른 Extension이 일반 웹사이트에서 HWP를 download한 뒤 Viewer로 자동 전환하는 구조라면 Unfold도 `chrome.downloads.onCreated`로 browser download metadata를 독립적으로 관찰하고 원래 URL, filename, finalUrl 등을 기억해 둘 수 있습니다. 이후 다른 Extension viewer tab이 활성화되었을 때 시간, filename 등을 이용해 correlation할 수 있습니다. 다만 correlation은 heuristic이며 binary는 다시 별도로 확보해야 합니다. `chrome.downloads`는 download metadata monitoring을 제공합니다. citeturn11search0

### 현재 실제 HWP Viewer 사례

2026년 8월 현재 Chrome Web Store에서 확인되는 가장 기술적으로 참고할 만한 사례는 **rhwp**입니다.

rhwp Chrome Extension은 2026년 8월 13일 기준 v0.8.4이며 Web Store에는 100,000명 이상의 사용자와 HWP/HWPX 자동 열기, 웹페이지 HWP 링크 자동 탐지, drag-and-drop, context menu, 브라우저 내부 WebAssembly 처리 등을 명시하고 있습니다. citeturn17view2

더 중요한 것은 프로젝트가 오픈소스이기 때문에 실제 Extension 구조를 확인할 수 있다는 점입니다. 현재 manifest는 **Manifest V3**, service worker, `<all_urls>` Content Script, `activeTab`, `downloads`, `storage` 등의 permission 및 `<all_urls>` host permission을 사용합니다. citeturn20view0

실제 downloader 구현도 `chrome.downloads.onCreated`와 `onChanged`를 관찰해 HWP/HWPX download를 판별하고 자체 Viewer를 여는 구조입니다. 즉 Unfold에서 제안하는 **"download event를 document discovery signal로 사용"**하는 패턴이 실제 공개 Extension에서 운영되고 있다는 좋은 사례입니다. citeturn24view0

rhwp 문서 엔진은 Rust + WebAssembly 기반이고 HWP 5.0, HWPX 파싱과 pagination을 구현합니다. Web rendering은 Canvas를 지원하며 현재 browser extension/embed/VS Code viewer 기본 경로는 Canvas2D, 조건에 따라 CanvasKit을 사용할 수 있도록 되어 있습니다. SVG와 PDF 출력도 별도로 지원합니다. citeturn17view0

따라서 rhwp를 "다른 설치된 Extension과 runtime 연동"하려고 하기보다, **MIT 라이선스의 rhwp engine을 Unfold 자체 Viewer에 dependency로 포함시키는 방향**이 훨씬 현실적입니다. rhwp 저장소는 MIT 라이선스를 명시합니다. citeturn17view0

rhwp에서 또 하나 주목할 만한 점은 보안입니다. 최근 release 기록에는 privileged fetch에 대해 sender 검증, localhost, loopback, private network, link-local URL 차단, redirect 후 최종 URL 재검사, 일부 fetch 경로의 `credentials: "omit"` 적용 같은 hardening이 기록돼 있습니다. 이것은 `<all_urls>`를 가진 document extension이 사실상 **브라우저 내부 SSRF primitive**가 될 수 있다는 점을 잘 보여줍니다. citeturn19view0

Chrome Web Store에는 이외에도 JiNi HWP, Hanview 같은 HWP/HWPX viewer가 존재하며 browser-side WASM 또는 local processing을 내세우는 제품들이 확인됩니다. Hancom Docs의 공식 Extension도 HWP 계열 문서 사용 사례를 제공합니다. 다만 공개 source가 없는 Viewer에 대해서는 실제 DOM, Canvas, PDF conversion pipeline을 Web Store 설명만으로 단정할 수 없습니다. citeturn13search5turn13search11turn13search3

즉 시장 사례에서 얻을 수 있는 결론은 다음입니다.

**"HWP를 브라우저 안에서 열고 분석하는 것"은 이미 실현 가능한 기술입니다. 반면 "다른 HWP Extension이 렌더링한 결과를 Unfold가 몰래 읽는다"는 것은 Chrome 보안 모델상 별개의 문제이고, 기본적으로 불가능합니다.**

### 자체 Document Viewer

**E. 자체 Viewer가 필요한 조건**

PDF에서는 PDF.js가 가장 현실적인 기준점입니다. PDF.js는 Mozilla가 유지하는 HTML5 기반 PDF parser/viewer이며 Chrome용 build를 공식 저장소에서 제공하고 Apache-2.0 라이선스를 사용합니다. citeturn23search0

Unfold가 PDF.js를 소유한 extension page 안에서 실행하면 Chrome built-in viewer에서 막혔던 대부분의 기능이 풀립니다.

| 요구 기능 | PDF.js 기반 Unfold Viewer |
|---|---|
| PDF rendering | **가능** |
| text selection/text layer | **가능** |
| annotation layer | **가능** |
| page jump | **완전 제어 가능** |
| current page state | **완전 제어 가능** |
| bbox Highlight | **직접 구현 가능** |
| Agent citation overlay | **직접 구현 가능** |
| keyboard navigation | **구현/확장 가능** |
| screen reader | **지원 가능, 원문 tagging 품질 의존** |
| custom accessibility layer | **가능** |
| selection ↔ Agent sync | **가능** |

PDF.js는 단순 canvas renderer만이 아니라 일반 purpose PDF viewer 플랫폼을 목표로 하고 있으며, 현재 release에서도 accessibility, text selection, annotation, keyboard accessibility가 지속적으로 개선되고 있습니다. citeturn23search0turn16search0

Tagged PDF의 structure tree 지원도 PDF.js에서 오랫동안 진행되어 실제 accessibility 개선으로 이어졌습니다. 다만 PDF 자체가 제대로 tagged되지 않았거나 scan image뿐인 문서라면 renderer가 없는 semantics를 만들어낼 수는 없습니다. 따라서 **screen reader 품질은 원본 PDF 구조 품질에 의존**합니다. citeturn23search6turn16search0

Unfold의 bbox highlight는 PDF.js 위에 별도 overlay layer를 두는 방식이 적합합니다.

```text
Page
├─ PDF Canvas
├─ PDF.js Text Layer
├─ Annotation Layer
├─ Unfold Highlight Layer
└─ Accessibility / Agent Semantic Layer
```

Agent가 `{page, x, y, width, height}`를 반환하면 PDF.js viewport transform과 동일 coordinate system으로 rectangle을 그리면 됩니다. 이 구조에서는 Highlight와 현재 viewport state가 모두 Unfold 소유이므로 Chrome PDF Viewer처럼 private API에 의존하지 않습니다. PDF.js가 PDF parsing/rendering을 웹 표준 기반으로 제공하기 때문에 가능한 설계입니다. citeturn23search0

HWP/HWPX에는 **rhwp WASM engine**이 현재 가장 흥미로운 오픈소스 선택지입니다. parser, pagination, Canvas2D/CanvasKit rendering, SVG/PDF export가 있고 브라우저 확장 자체가 실제 배포 중입니다. citeturn17view0turn17view2

다만 rhwp의 현재 browser renderer가 Canvas 중심이라는 점은 Unfold 입장에서 중요한 차이입니다. Agent citation이나 screen reader를 위해서는 canvas만 사용하는 것이 아니라 rhwp의 document model 또는 render tree에서 **별도의 semantic/text overlay를 생성하는 작업**이 필요합니다. 이 부분은 PDF.js의 text layer와 동등한 Unfold-specific layer를 만드는 추가 개발로 봐야 합니다. citeturn17view0

DOCX에는 `docx-preview`가 browser-only POC에 현실적입니다. 이 라이브러리는 DOCX의 `Blob`, `ArrayBuffer`, `Uint8Array`를 입력받아 지정된 HTMLElement에 문서를 렌더링할 수 있습니다. 따라서 파일을 서버에 올리지 않고 Extension package 안에서 실행하는 구조가 가능합니다. citeturn23search1

다만 DOCX는 Word의 복잡한 pagination/layout model을 그대로 브라우저 HTML에 재현해야 하므로, "Agent 분석"과 "픽셀 단위 Word 호환 Viewer"를 같은 문제로 보지 않는 편이 좋습니다. P0/P1에서는 **텍스트와 구조 추출, 합리적인 preview**를 목표로 하고 완전한 Microsoft Word rendering fidelity를 제품 약속으로 잡지 않는 것을 권장합니다.

그리고 PDF.js, rhwp WASM, docx renderer 같은 code는 **Extension package에 번들링해야 합니다.** Manifest V3 Web Store 정책은 Extension 외부에서 가져온 JavaScript나 WASM을 실행하는 remote hosted code를 금지합니다. 데이터 파일을 원격에서 받는 것과 remote executable code를 받는 것은 구분됩니다. citeturn22search26

## Side Panel과 권장 Extension Architecture

Chrome Side Panel API는 Unfold 제품 UX와 상당히 잘 맞습니다.

**특정 tab 연동**은 `sidePanel.setOptions({tabId, path, enabled})`로 가능합니다. 사용자의 gesture 이후 `sidePanel.open({tabId})`로 열 수 있으며, panel은 Extension page이므로 Chrome Extension API를 호출할 수 있습니다. citeturn0search0

**tab별 state**는 `tabId`를 document session key로 삼는 것이 좋습니다. Service Worker의 global variable은 상태 저장소로 사용하면 안 됩니다. MV3 extension service worker는 보통 30초 inactivity 후 종료될 수 있고, 단일 이벤트가 너무 오래 수행되거나 fetch response가 오래 걸리는 경우에도 lifecycle 제한이 있습니다. Chrome은 service worker가 예상치 못하게 종료되어도 동작하도록 상태를 외부에 저장하라고 권고합니다. citeturn22search1turn22search5

따라서 binary parsing 같은 장시간 작업을 service worker에 넣는 것은 권장하지 않습니다.

**F. 권장 Chrome Extension Architecture**

```text
                        ┌────────────────────────┐
                        │     Side Panel UI      │
                        │                        │
                        │ chat / candidates      │
                        │ current document state │
                        └────────────┬───────────┘
                                     │ runtime messaging
                                     ▼
┌─────────────────┐        ┌────────────────────────┐
│ Content Script  │◀──────▶│ MV3 Service Worker     │
│                 │        │                        │
│ DOM scanner     │        │ session coordinator    │
│ link detector   │        │ permission manager     │
│ iframe scanner  │        │ download observer      │
│ page highlight  │        │ webRequest observer    │
└────────┬────────┘        │ URL security policy    │
         │                 └───────────┬────────────┘
         │                             │
         │                             │ source descriptor
         │                             ▼
         │                  ┌────────────────────────┐
         │                  │  Unfold Viewer Tab     │
         │                  │ chrome-extension://   │
         │                  │                        │
         │                  │ privileged fetch      │
         │                  │ Web Worker parsing     │
         │                  │ PDF.js                 │
         │                  │ rhwp WASM              │
         │                  │ docx-preview           │
         │                  └──────────┬─────────────┘
         │                             │
         └─────────────────────────────┘
                 viewport / citation sync
```

여기서 **Service Worker는 orchestration만 담당**시키는 것이 좋습니다. URL validation, permissions, tab lifecycle, `downloads`, `webRequest`, Side Panel routing 정도입니다. DOM이 필요한 작업은 Content Script, 실제 문서 rendering과 heavy parsing은 Viewer page와 Web Worker가 담당합니다. MV3 service worker에는 DOM과 `window`가 없고 lifecycle도 비영속적입니다. citeturn22search5turn22search1

Binary fetch도 반드시 service worker에서 해야 할 필요는 없습니다. Unfold Viewer와 Side Panel 역시 Extension origin의 페이지이므로 host permission을 이용한 cross-origin fetch를 수행할 수 있습니다. 장시간 PDF/HWP 파싱이 이어질 문서는 **long-lived Viewer page에서 fetch하고 Web Worker로 넘기는 편이 lifecycle 측면에서 단순합니다.** citeturn2view0turn22search1

Side Panel에서 현재 웹페이지를 조작할 때는 다음 흐름을 권장합니다.

```text
Side Panel
   ↓
Service Worker
   ↓ chrome.tabs.sendMessage(tabId)
Content Script
   ↓
scroll / highlight / click-safe action
```

일반 웹페이지라면 Content Script가 대상 DOM으로 scroll하거나 attachment link 주변을 Highlight할 수 있습니다. Chrome PDF Viewer에서는 Content Script가 없으므로 `tabs.update()`로 `#page=...`, `#zoom=...`, Text Fragment 같은 URL 기반 명령만 사용합니다. 자체 Viewer에서는 같은 Extension의 document session protocol로 완전하게 제어합니다. citeturn0search0turn8view0turn8view1

한 페이지에 문서가 여러 개라면 Side Panel의 state를 "현재 문서 한 개"로 고정하면 안 됩니다. 다음과 같은 candidate registry를 먼저 만드는 것이 좋습니다.

```ts
type DocumentCandidate = {
  id: string;
  tabId: number;
  frameId: number;
  source:
    | "anchor"
    | "iframe"
    | "network"
    | "download"
    | "blob"
    | "viewer";

  url?: string;
  filename?: string;
  mimeHint?: string;

  authScope?: string;
  discoveryConfidence: number;

  originText?: string;
  requiresHostPermission: boolean;
};
```

`anchor scan`, network event, download event에서 같은 파일을 여러 번 발견할 수 있으므로 final URL, filename, request correlation 등을 이용해 deduplicate하고 Side Panel에 **"이 페이지에서 발견한 문서 7개"**처럼 보여주는 것이 좋습니다. 이것은 여러 진입점을 하나의 제품 모델로 통합할 수 있다는 장점이 있습니다.

### 권한 구성

**G. 필요한 Manifest V3 permissions**

P0에서는 broad `<all_urls>`를 처음부터 요구하지 않는 구성이 가장 좋습니다.

```json
{
  "manifest_version": 3,
  "name": "Unfold",
  "version": "0.1.0",

  "permissions": [
    "activeTab",
    "scripting",
    "sidePanel",
    "storage"
  ],

  "optional_permissions": [
    "tabs",
    "downloads",
    "webRequest",
    "cookies"
  ],

  "optional_host_permissions": [
    "https://*/*",
    "http://*/*",
    "file:///*"
  ],

  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },

  "side_panel": {
    "default_path": "side-panel/index.html"
  },

  "action": {
    "default_title": "Open Unfold"
  }
}
```

권한별 추천은 다음과 같습니다.

| Permission | 단계 | 이유 |
|---|---|---|
| `sidePanel` | **P0 required** | 핵심 UI |
| `activeTab` | **P0 required** | 사용자 실행 시 현재 페이지 접근 |
| `scripting` | **P0 required** | DOM scanner 동적 주입 |
| `storage` | **P0 required** | tab/document state |
| HTTP/HTTPS optional hosts | **P0/P1 optional** | document binary fetch |
| `tabs` | **P1 optional** | 사용자 gesture 밖에서도 URL/state 지속 추적 필요할 때 |
| `downloads` | **P1 optional** | 실제 download 자동 탐지 |
| `webRequest` | **P1 optional** | Content-Disposition, POST/network metadata |
| `file:///*` | **P1 optional** | local files |
| `cookies` | **P2, 가급적 없음** | 직접 cookie inspection이 정말 필요할 때만 |
| `declarativeNetRequest` | 불필요 | 요청 block/modify가 핵심이 아님 |
| `webRequestBlocking` | 사용하지 않음 | 일반 MV3 Web Store 설계에 맞지 않음 |

Chrome은 `activeTab`을 사용자가 직접 Extension을 호출했을 때 임시 host access를 부여하는 최소 권한 패턴으로 권장합니다. 반대로 `<all_urls>`처럼 넓은 match pattern은 모든 사이트에 대한 접근이 되며 심사 범위와 사용자 신뢰 비용을 키울 수 있습니다. citeturn2view1turn9search1turn15search2

`cookies`는 특히 처음부터 넣지 않는 것이 중요합니다. session cookie를 HTTP 요청에 사용하는 것은 `cookies` API 없이 가능하며, 해당 permission은 실제 cookie 값을 읽거나 수정할 때 필요한 권한입니다. citeturn22search0turn22search4

`downloads`는 HWP/PDF 자동 탐지 품질을 크게 올려주지만, 모든 사용자가 처음부터 필요로 하는 기능은 아닐 수 있습니다. Chrome permissions API는 optional permission과 optional host permissions를 사용자가 특정 기능을 사용하는 시점에 요청할 수 있도록 지원합니다. citeturn15search11

### 보안과 Web Store 리스크

Unfold는 본질적으로 **사용자의 browsing content를 읽고, authenticated resource를 fetch할 수 있는 Extension**입니다. 따라서 Web Store reviewer 관점에서도 권한 정당화가 매우 중요합니다.

Chrome Web Store 정책은 현재 기능 구현에 필요한 **가장 좁은 permission만 요청**해야 하며 미래 기능을 대비해 broad permission을 미리 요청하는 것을 허용하지 않습니다. optional permission에도 같은 원칙이 적용됩니다. citeturn15search2turn15search22

또한 browsing activity의 수집과 사용은 사용자에게 명확히 공개된 user-facing single purpose에 필요한 범위여야 합니다. user data를 다루는 Extension은 privacy policy와 데이터 사용 방식을 명확히 공개해야 합니다. citeturn15search8turn15search14

따라서 Unfold의 Web Store single-purpose 문구는 넓은 **"AI 브라우저 Agent"**보다 다음 정도가 심사 설명에 훨씬 적합합니다.

> **"사용자가 현재 보고 있는 웹페이지의 문서 및 첨부파일을 발견하고, 사용자의 명시적 요청에 따라 브라우저 내에서 분석하고 탐색하도록 돕는 Document Assistant"**

자동으로 모든 tab을 계속 scan하거나 모든 network request를 저장하는 방식은 피하고, 사용자 action 이후 현재 tab을 중심으로 activation하는 것이 좋습니다.

또 하나의 중요한 보안 이슈는 privileged fetch입니다. Chrome Extension security guide는 Content Script를 신뢰할 수 없는 웹페이지와 맞닿는 경계로 보고, content script가 service worker에 임의 URL을 넘겨 privileged fetch를 수행하도록 만들지 말라고 경고합니다. citeturn10search19

따라서 다음과 같은 정책이 필요합니다.

```text
Content Script
  "https://example.com/file.pdf 가져와줘"
          │
          ▼
Service Worker
  1. sender.tab 검증
  2. candidate가 실제 DOM에서 발견된 URL인지 검증
  3. scheme 검증
  4. host permission 검증
  5. localhost/private/link-local 차단
  6. redirect 후 target 재검증
          │
          ▼
       fetch
```

공개 HWP Extension rhwp 역시 최근 버전에서 sender validation, loopback/private network 차단, redirect 이후 URL 재검증 같은 조치를 실제로 적용하고 있습니다. Unfold에서도 이 수준의 방어를 초기에 넣는 것이 맞습니다. citeturn19view0

## 위험 가정, POC와 우선순위

**H. 가장 위험한 기술 가정**

| 위험 가정 | 실제 판단 | 영향도 |
|---|---|---:|
| Chrome PDF Viewer에 Content Script를 넣을 수 있다 | **거의 확실히 틀림** | 매우 높음 |
| Chrome PDF Viewer 위에 arbitrary Highlight overlay를 만들 수 있다 | **틀림** | 매우 높음 |
| 현재 보이는 PDF는 URL을 다시 fetch하면 항상 같은 bytes가 나온다 | **틀릴 수 있음** | 매우 높음 |
| POST PDF/HWP도 기존 response를 Extension이 읽을 수 있다 | **틀림** | 매우 높음 |
| 다른 HWP Extension DOM/Canvas를 읽을 수 있다 | **틀림** | 높음 |
| host permission만 있으면 모든 로그인 request가 재현된다 | **틀림** | 높음 |
| `cookies` permission이 로그인 유지에 필수다 | **틀림** | 중간 |
| local PDF는 permission UX 없이 바로 읽을 수 있다 | **틀림** | 중간 |
| HWP Canvas Viewer가 바로 screen-reader friendly하다 | **틀림** | 중간 |
| `<all_urls>`와 broad network permissions를 처음부터 요구해도 심사상 문제없다 | **위험함** | 높음 |

가장 위험한 것은 **Chrome PDF Viewer integration을 "DOM integration 문제"라고 보는 것**입니다. 실제로는 Chrome의 protected component와의 경계 문제입니다. 이 가정을 제거하면 전체 architecture가 훨씬 단순해집니다. citeturn7view0turn7view1turn15search17

두 번째 위험은 binary acquisition입니다. URL을 알고 있다는 사실과 동일 bytes를 다시 가져올 수 있다는 사실은 다릅니다. authenticated GET은 상당히 잘 처리할 수 있지만, POST response, one-time URL, JS-memory bearer token, Blob 등은 각각 다른 resolver가 필요합니다. `webRequest`는 network metadata를 잘 보여주지만 response body extractor가 아닙니다. citeturn12view0

**I. 2시간 안에 실행할 POC 목록**

아래 순서라면 **120분 안에 핵심 가설 대부분을 죽이거나 살릴 수 있습니다.**

| 시간 | POC | 성공 기준 |
|---:|---|---|
| 15분 | MV3 + Side Panel skeleton | 일반 HTML, direct PDF 탭에서 panel open |
| 15분 | PDF tab URL + injection probe | URL 확보, PDF 내부 script injection 실패 여부와 exact error 기록 |
| 20분 | PDF URL navigation | `#page`, `#zoom`, `#:~:text` 각각 실제 이동/Highlight 확인 |
| 20분 | binary fetch | public PDF, cookie-auth PDF, `file://` PDF 각각 ArrayBuffer 확보 |
| 25분 | attachment fixture | anchor, Content-Disposition, JS download, Blob, POST를 candidate로 기록 |
| 25분 | PDF.js own Viewer | 같은 PDF를 열고 page jump + 임의 bbox overlay 성공 |

첫 POC에서는 반드시 이 네 탭을 동시에 비교해야 합니다.

```text
A. https://... normal HTML
B. https://.../document.pdf
C. file:///.../document.pdf
D. chrome-extension://<other-extension>/viewer.html
```

측정 결과는 다음 boolean matrix로 남기는 것이 좋습니다.

```text
sidePanelOpen
tabUrlReadable
contentScriptInjectable
binaryFetchable
pageNavigable
textHighlightable
bboxOverlayPossible
```

이 결과만 있어도 Chrome 기본 Viewer와 자체 Viewer 사이의 제품 경계를 확정할 수 있습니다.

Attachment fixture에서는 작은 localhost test server를 만들어 다음 endpoint만 있으면 충분합니다.

```text
/static.pdf
/attachment            -> Content-Disposition: attachment
/auth.pdf               -> cookie required
/post-pdf               -> POST response application/pdf
/js-download            -> JS-triggered fetch/download
/blob                   -> page-generated Blob
/redirect               -> redirect -> PDF
```

`webRequest`의 `onBeforeRequest`, `onHeadersReceived`와 `downloads.onCreated` 로그를 한 화면에 함께 남겨 **어느 signal이 어떤 케이스를 잡는지** 비교하는 것이 핵심입니다. `webRequest`와 downloads API는 각각 request lifecycle과 browser download lifecycle을 관찰합니다. citeturn12view0turn11search0

local PDF POC에서는 반드시 `chrome.extension.isAllowedFileSchemeAccess()` 결과와 실제 fetch 성공 여부를 같이 기록하세요. Chrome의 file access는 사용자 설정에 의해 통제됩니다. citeturn9search3

**J. P0/P1/P2 추천**

| Priority | 구현 범위 | 이유 |
|---|---|---|
| **P0** | Side Panel, `activeTab`, 일반 DOM scanner, 다중 attachment list, direct PDF URL 식별, authenticated GET fetch, PDF.js Viewer, PDF page/bbox citation | 제품 핵심 가설 검증 |
| **P1** | `downloads`, `webRequest`, Content-Disposition, local file, Blob, cross-origin optional permission, rhwp HWP/HWPX Viewer, DOCX preview | 실사이트 coverage 확대 |
| **P2** | JS MAIN-world instrumentation, POST replay, bearer/CSRF adapters, Chrome PDF Text Fragment convenience, 다른 Extension 협력 adapter, autonomous one-hop discovery | 복잡도 대비 범용성 낮음 |

**P0에서 하지 말아야 할 것**은 명확합니다.

Chrome PDF Viewer DOM을 reverse-engineer해 overlay하려고 하지 말아야 합니다. 다른 HWP Extension DOM을 우회해서 읽으려 하지 말아야 합니다. `cookies`를 처음부터 요청하지 말아야 합니다. `<all_urls>` host permission과 `webRequest`를 기본 install permission으로 모두 요구하지 말아야 합니다. Manifest V3 remote WASM/JavaScript loading에도 의존하면 안 됩니다. 이 네 가지는 각각 Chrome의 보호 경계, 최소 권한 정책, MV3 remote hosted code 정책과 직접 충돌하거나 유지보수성이 매우 낮습니다. citeturn15search17turn15search2turn22search26

제품 흐름은 최종적으로 다음이 가장 현실적입니다.

```text
사용자가 웹페이지/PDF를 본다
          │
          ▼
     Unfold 실행
          │
          ▼
   현재 tab 식별
          │
          ├─ 일반 HTML
          │    └─ DOM + network + download candidates
          │
          ├─ Chrome PDF
          │    ├─ Side Panel 유지
          │    ├─ original URL fetch
          │    ├─ 간단한 page/text jump
          │    └─ 정밀 citation 필요 → Open in Unfold
          │
          ├─ 다른 Extension Viewer
          │    ├─ tab 정보
          │    ├─ 과거 download correlation
          │    └─ binary 없으면 직접 통합 포기
          │
          └─ file://
               ├─ file access 확인
               └─ Unfold Viewer

                 ▼
          Unfold Document Viewer
          ├─ PDF.js
          ├─ rhwp WASM
          ├─ docx-preview
          └─ unified semantic model

                 ▼
             Document Agent
          page / bbox / citation
```

이 구조에서 **Chrome 기본 Viewer는 "문서를 발견한 화면", Unfold Viewer는 "문서를 깊게 이해하고 조작하는 화면"**으로 역할이 명확히 나뉩니다.

가장 중요한 제품적 판단은 **사용자를 항상 자체 Viewer로 강제로 이동시키지 않는 것**입니다. 단순 질문, 요약, 문서 후보 탐색은 Side Panel에서 현재 화면을 유지한 채 처리하고, **"3페이지의 이 조항 보여줘", "이 문장의 원문을 강조해줘", "Agent 답변의 근거 위치를 표시해줘"처럼 좌표가 필요한 순간에만 자체 Viewer로 전환**하는 것이 Chrome 보안 모델과 UX를 동시에 만족시키는 구조입니다.

## 출처

**K. 주요 출처**

Chrome Extension의 핵심 권한과 execution model은 Chrome 공식 **Side Panel API**, **Tabs API**, **activeTab**, **Content Scripts**, **Scripting API**, **Cross-origin network requests** 문서를 기준으로 검토했습니다. citeturn0search0turn0search2turn2view1turn22search11turn9search0turn2view0

로그인 세션과 local file access는 Chrome 공식 **Storage and cookies**, **Cookies API**, **Match patterns**, **isAllowedFileSchemeAccess** 문서를 기준으로 했습니다. citeturn22search0turn22search4turn9search1turn9search3

Network와 download detection은 현재 Chrome 공식 **webRequest API**와 **downloads API**를 기준으로 했습니다. MV3에서 response/request metadata를 어디까지 관찰할 수 있고, 어디부터 binary extraction이 불가능한지 판단하는 핵심 근거입니다. citeturn12view0turn11search0

Chrome 기본 PDF Viewer의 구조와 제한은 문서 설명보다 **현재 Chromium source**를 직접 확인했습니다. built-in PDF extension manifest, BrowserApi와 `getStreamInfo`, plugin wrapper, internal scripting API, `pdfViewerPrivate`, PDF open parameter parser가 핵심 근거입니다. citeturn7view0turn4view1turn4view2turn7view1turn7view2turn8view0turn8view1

PDF Text Fragment의 실제 Highlight 처리는 Chromium PDF web plugin의 `HandleHighlightTextFragmentsMessage()`와 PDF engine 호출에서 확인할 수 있습니다. citeturn23search2

다른 Extension에 대한 보안 경계는 Chrome의 current privileged-renderer injection 방어, `webRequest`의 다른 Extension 요청 비노출 규칙, Web Accessible Resources, Extension 간 messaging 문서를 기준으로 판단했습니다. citeturn15search17turn12view0turn22search2turn10search14

HWP의 실제 구현 사례로는 2026년 8월 현재 Chrome Web Store에 배포 중인 **rhwp v0.8.4**와 공개 source를 검토했습니다. 실제 MV3 manifest, `downloads.onCreated` 기반 interceptor, Rust/WASM parser와 Canvas rendering architecture를 확인할 수 있습니다. citeturn17view2turn20view0turn24view0turn17view0

자체 PDF Viewer 후보는 Mozilla의 공식 **PDF.js** 저장소와 최근 accessibility/annotation 관련 release를, DOCX는 `docx-preview`의 primary repository를 기준으로 검토했습니다. citeturn23search0turn16search0turn23search6turn23search1

Manifest V3의 background architecture는 Chrome 공식 Extension Service Worker lifecycle과 migration 문서를 기준으로 했습니다. Service Worker를 heavy document parser로 사용하지 말아야 하는 주요 근거입니다. citeturn22search1turn22search5

Chrome Web Store 배포 리스크는 현재 **Minimum Permission, User Data, Limited Use, Permission Justification, Remote Hosted Code** 정책을 기준으로 평가했습니다. citeturn15search2turn15search8turn15search14turn15search22turn22search26

Agentic Link Discovery의 robots.txt 관련 판단은 IETF **RFC 9309 Robots Exclusion Protocol**을 기준으로 했습니다. RFC는 robots 규칙을 crawler용 protocol로 정의하지만 access authorization 수단은 아니라고 명시합니다. citeturn22search3