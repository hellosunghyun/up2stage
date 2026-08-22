# Unfold: JunctionX Korea 2026 Upstage Track 기술 가능성 검증

**조사 기준일: 2026-08-22, Asia/Seoul**

## A. Executive Summary

결론부터 말하면, **Unfold의 핵심 기능 대부분은 현재 Upstage 공식 API와 Studio Agent API로 구현 가능합니다.** 특히 2026년의 Upstage Studio는 단순한 노코드 데모가 아니라 `File → Agent → Config → Job` 구조의 **Document Agent API v2**를 제공하며, `Document Parse → Document Classify → Information Extract → Instruct`를 조건 분기 가능한 DAG로 구성하고 애플리케이션에서 `Agent ID`를 호출할 수 있습니다. Studio에서 만든 Agent뿐 아니라 Agent와 Config 자체를 REST API로 생성하는 것도 공식 레퍼런스에 명시되어 있습니다. fileciteturn8file0 fileciteturn10file0

가장 중요한 발견은 **HWP와 HWPX가 현재 공식 지원 대상**이라는 점입니다. standalone Document Parse API의 공식 UpstageAI GitHub 레퍼런스는 PDF, JPEG, PNG, BMP, TIFF, HEIC, DOCX, PPTX, XLSX, HWP, HWPX를 직접 입력 형식으로 열거하고 있습니다. 과거 Upstage 발표에서도 HWP/HWPX를 업로드하면 내부적으로 자동 변환해 처리한다고 명시했습니다. Studio v2 Files API는 여기서 더 넓어져 **구형 DOC, PPT, XLS까지 업로드 입력으로 허용**합니다. fileciteturn1file0 fileciteturn12file0 citeturn11search21

Unfold의 차별점인 **"답변을 클릭하면 원문 위치를 보여주는 기능"도 구현 가능**합니다. Document Parse의 element에는 `id`, `page`, `coordinates`가 있으며, Information Extract는 `location`을 켜면 추출 필드별 source location을 제공하고 Studio에서는 `location_granularity`를 `all`, `element`, `word`로 지정할 수 있습니다. fileciteturn1file0 fileciteturn9file0 citeturn30search6

다만 **Instruct 또는 Solar가 생성한 자연어 답변에서 "이 답변은 Parse element 37의 polygon을 근거로 했다"는 식의 end-to-end citation을 자동 반환하는 기능은 현재 공식 API에서 확인되지 않았습니다.** 이 부분은 Unfold가 직접 `source_id → page → polygon` 매핑 레이어를 만들어야 합니다. Instruct는 이전 Parse/Classify/Extract 결과를 자동 context로 받지만, 공식 step definition에는 citation, evidence element ID, bounding box 반환 필드가 없습니다. fileciteturn9file0

따라서 **가장 안정적인 Unfold 구조는 "Studio Agent를 문서 이해 파이프라인으로 사용하고, Source Grounding과 다중 문서 Q&A는 Unfold backend가 직접 오케스트레이션하는 구조"**입니다.

```text
Chrome Extension
    │
    ├─ 공고 본문 추출
    ├─ 첨부 링크 탐지
    └─ 파일 다운로드
             │
             ▼
        Unfold Backend
             │
             ├─ Studio /v2/files
             │
             ▼
    ┌──────────────────────────────┐
    │ Upstage Studio Agent        │
    │                              │
    │ Parse                        │
    │   ↓                          │
    │ Classify                     │
    │   ├─ 공고/자격 → Extract A   │
    │   ├─ 신청서   → Extract B   │
    │   └─ 무관문서 → 종료         │
    │            ↓                 │
    │        Instruct(optional)    │
    └──────────────────────────────┘
             │
             ├─ element/page/polygon 저장
             ├─ extracted facts + locations 저장
             │
             ▼
       Bundle-level retrieval
             │
             ▼
         Solar Pro 4
             │
       answer + source_ids
             │
             ▼
      Citation Resolver
             │
      page + polygon highlight
```

Upstage 자체도 Document Parse를 **search, Q&A, RAG를 위한 full-document representation**, Information Extract를 **업무 자동화를 위한 schema-aligned JSON**으로 구분하고 있으며, 둘을 함께 사용할 것을 공식적으로 제시합니다. citeturn27search8turn25search14

현재 기술 판정만 요약하면 다음과 같습니다.

| Unfold 핵심 기능 | 판정 | 핵심 이유 |
|---|---|---|
| PDF 분석 | **Confirmed** | Parse 공식 입력 |
| HWP/HWPX 분석 | **Confirmed** | 직접 업로드 + 내부 변환 지원 |
| DOC/PPT/XLS | **Confirmed via Studio** | Studio Files API v2 지원, standalone Parse 목록에는 없음 |
| 제목/문단/목록/표 구조화 | **Confirmed** | element category + HTML/Markdown |
| 장문 100페이지 이상 | **Confirmed** | Parse async 최대 1,000 pages |
| Extract schema | **Confirmed** | JSON Schema |
| Classify custom taxonomy | **Confirmed** | `oneOf` + description |
| mixed PDF auto split | **Confirmed** | Classify `split=true` |
| 조건 분기 Agent | **Confirmed** | Config DAG `next_steps.condition` |
| Instruct Q&A | **Confirmed** | Studio Instruct step |
| Extract → 원문 위치 | **Confirmed** | location/page/coordinates |
| Parse → 원문 위치 | **Confirmed** | element ID/page/coordinates |
| Answer → page citation | **Possible** | 자체 source-ID 매핑 필요 |
| Answer → exact bbox | **Possible** | retrieval citation → Parse polygon 매핑 필요 |
| Instruct native citation | **Unclear** | 공식 citation 필드 확인 안 됨 |
| 다중 첨부 cross-document Q&A | **Possible** | bundle/RAG 또는 long-context layer 필요 |
| Semantic Accessible HTML | **Possible** | Parse HTML은 가능, WCAG 보장은 별도 구현 |
| Studio 내부 arbitrary REST node | **현재 문서상 불가** | 공개 v2 step type은 4종 |
| Webhook 기반 완료 통지 | **현재 미확인** | 공식 Studio 페이지에서 Webhook은 coming soon, API는 polling 구조 |

## B-C. 지원 문서 형식과 Parse 상세 Capability

**B. 지원 문서 형식 전체 표**

여기서 반드시 **standalone Document Parse API**와 **Studio Document Agent v2 Files API**를 구분해야 합니다. 둘의 입력 범위와 제한이 다릅니다. standalone Parse 공식 레퍼런스는 11개 계열을 명시하고 있고, Studio Files API는 구형 Office 형식까지 더 넓게 허용합니다. fileciteturn1file0 fileciteturn12file0

| 형식 | standalone Document Parse | Studio v2 File | Unfold 판단 |
|---|---:|---:|---|
| PDF | **직접 입력 O** | **직접 입력 O** | 가장 안정적 |
| HWP | **직접 입력 O** | **직접 입력 O** | 내부 변환 후 처리 |
| HWPX | **직접 입력 O** | **직접 입력 O** | 내부 변환 후 처리 |
| DOC | 공식 Parse 목록에는 없음 | **직접 입력 O** | Studio 경로 권장 |
| DOCX | **직접 입력 O** | **직접 입력 O** | 공식 지원 |
| PPT | 공식 Parse 목록에는 없음 | **직접 입력 O** | Studio 경로 권장 |
| PPTX | **직접 입력 O** | **직접 입력 O** | 공식 지원 |
| XLS | 공식 Parse 목록에는 없음 | **직접 입력 O** | Studio 경로 권장 |
| XLSX | **직접 입력 O** | **직접 입력 O** | 공식 지원 |
| JPEG/JPG | **직접 입력 O** | JPG 지원 | 이미지 문서 가능 |
| PNG | **직접 입력 O** | **직접 입력 O** | 지원 |
| BMP | **직접 입력 O** | **직접 입력 O** | 지원 |
| TIFF | **직접 입력 O** | **직접 입력 O** | 지원 |
| HEIC | **직접 입력 O** | **직접 입력 O** | 지원 |
| HTML | **공식 입력 목록에 없음** | **공식 입력 목록에 없음** | 본문 text로 별도 취급하거나 PDF 렌더링 |
| TXT | 공식 입력 목록에 없음 | 공식 입력 목록에 없음 | Parse 대신 text context 사용 |
| CSV | 공식 입력 목록에 없음 | 공식 입력 목록에 없음 | 필요 시 XLSX/PDF 또는 직접 구조화 |
| ZIP | 지원 안 됨 | 415 unsupported 예시 존재 | extension에서 먼저 압축 해제 필요 |

Standalone Parse 형식과 한도는 UpstageAI가 2026년 5월 갱신한 공식 extension reference에 PDF, 이미지, DOCX, PPTX, XLSX, HWP, HWPX로 명시되어 있습니다. Studio v2는 `jpg, png, bmp, tiff, heic, pdf, doc, docx, ppt, pptx, xls, xlsx, hwp, hwpx`를 허용합니다. fileciteturn1file0 fileciteturn12file0

**HWP와 HWPX의 의미는 특히 중요합니다.** Upstage가 2025년 Document Parse 업데이트를 발표하면서 HWP와 HWPX를 업로드할 수 있으며 **Document Parse가 자동 변환해 처리한다**고 공식적으로 설명했습니다. 따라서 Unfold가 HWP parser를 직접 개발할 필요는 없습니다. citeturn11search21

다만 이것은 "HWP 내부 XML/compound-document 구조를 native semantic parser가 직접 해석한다"는 뜻과는 다릅니다. 공식 표현은 자동 변환입니다. 따라서 한컴 특유의 글상자, 도형, 수식, 중첩 표, 배경 이미지, OLE 객체, 비표준 글꼴까지 100% 동일하게 보존된다고 가정하면 안 됩니다. **실제 학교와 공공기관 HWP를 POC corpus에 반드시 포함해야 합니다.**

Studio의 경우 한 단계 더 유용합니다. 파일을 업로드한 뒤 **자동으로 page image conversion**을 수행하고, Files API에서 `num_pages`, 각 `page.id`, `idx`, `status`, `image_url`을 조회할 수 있습니다. 이는 Chrome에서 HWP를 직접 렌더링할 필요 없이 Upstage가 만든 page image를 Source Viewer의 기준 화면으로 사용할 수 있다는 뜻입니다. fileciteturn12file0

Unfold에서 HWP/HWPX의 fallback은 다음처럼 잡는 것이 안전합니다.

```text
HWP/HWPX
  │
  ├─ 1차: Studio /v2/files direct upload
  │       ↓
  │   Upstage page-image conversion + Parse
  │
  └─ 실패 시:
      server-side high-fidelity HWP renderer
        → PDF
        → Document Parse
```

**웹 공고 본문 HTML은 별개입니다.** HTML 파일 자체는 공식 입력 목록에 없으므로, extension이 `<main>`, `article`, 게시판 본문 등을 직접 정제해 **text source로 bundle에 저장**하는 편이 낫습니다. 반드시 Parse해야 한다면 브라우저 렌더 결과를 PDF로 만들어 문서와 동일한 pipeline에 넣는 방식을 사용할 수 있습니다. Studio Job 자체는 `input_file`과 `input_text`를 함께 받을 수 있습니다. fileciteturn11file0

**C. Parse 상세 Capability Matrix**

현재 standalone Document Parse API는 HTML/Markdown 중심이며 response 자체는 JSON envelope입니다. 공식 response example은 `content.html`, `content.markdown`, `content.text`와 별도의 `elements[]`를 반환합니다. 각 element는 `id`, `category`, `page`, `coordinates`, element별 HTML/Markdown/Text를 가질 수 있습니다. fileciteturn1file0

Studio Parse step은 `output_formats`로 `html`, `text`, `markdown`, `pdf`를 열거합니다. Studio UI 튜토리얼에서는 결과를 Preview, HTML, JSON으로 확인할 수 있다고 설명합니다. fileciteturn9file0 citeturn16view4

| Parse 요구사항 | 지원 | 상세 판정 |
|---|---|---|
| HTML | **Confirmed** | 전체 document content + element별 HTML |
| Markdown | **Confirmed** | API 공식 output |
| Text | **Confirmed** | element/Studio output |
| JSON | **Confirmed as response structure** | `json`이 markup output format이라기보다 API response와 `elements[]` 구조 |
| 제목 | **Confirmed** | `heading1`, `heading2`, `heading3` |
| 문단 | **Confirmed** | `paragraph` |
| 목록 | **Confirmed** | `list` |
| 명시적 hierarchy tree | **부분 지원** | heading level은 있지만 parent/child tree ID는 공식 response에 없음 |
| 표 | **Confirmed** | `table`, HTML representation |
| multi-page table | **Confirmed** | `merge_multipage_tables` 지원 |
| 병합 셀 | **Possible, POC 필요** | 복잡한 table 지원은 확인됐지만 rowspan/colspan fidelity를 별도 보장하는 명시적 계약은 확인 못함 |
| 이미지/figure | **Confirmed** | `figure`, base64 encoding 가능 |
| 차트 | **Confirmed** | `chart`, `chart_recognition` |
| 다이어그램 | **Enhanced에서 가능** | visual description 기능, 구조 fidelity는 POC |
| 수식 | **Confirmed** | `equation` element |
| 체크박스 | **Enhanced에서 Confirmed** | Enhanced 발표에서 checked/unchecked 이해 |
| 서명 | **Parse는 Unclear** | Parse category에 signature 없음, Extract는 signature 값을 다룰 수 있음 |
| Caption | **Confirmed** | `caption` |
| Header/Footer | **Confirmed** | element category |
| 각주 | **Confirmed** | `footnote` category |
| Index | **Confirmed** | `index` |
| 페이지 번호 | **Confirmed** | element별 `page` |
| 페이지 경계 | **Confirmed** | 각 element가 page에 귀속 |
| 읽기 순서 | **Confirmed at serialization level** | document 구조를 읽기 가능한 HTML/Markdown으로 직렬화 |
| element ID | **Confirmed** | `id` 존재 |
| ID의 재실행 간 영속성 | **Unclear** | stable global ID 보장은 없음 |
| 좌표 | **Confirmed** | `coordinates` 기본 true |
| polygon | **Confirmed 형태** | `{x,y}` 점들의 배열 |
| bbox | **직접 계산 가능** | polygon에서 min/max x/y 계산 |
| 좌표 단위 | **Unclear** | 공식 sample은 0.x 값이지만 명시적 unit 계약은 확인 필요 |
| 좌표 origin/axis | **Unclear** | viewer transform POC 필수 |
| Semantic HTML | **Confirmed as structured HTML** | accessibility/WCAG는 별도 |
| 100페이지 초과 | **Confirmed via async** | 최대 1,000 pages |
| async page chunk | **Confirmed** | 최대 10페이지 단위 batch |
| standalone file size | **50 MB** | sync/async 동일 |
| standalone sync page limit | **100 pages** | 5분 timeout |
| standalone async page limit | **1,000 pages** | polling |
| Studio Files page limit | **1,000 pages** | File API |
| Studio Files size limit | **500 MB** | standalone Parse보다 큼 |
| Studio Extract Enhanced | **50-page limit** | Standard는 장문 처리 경로 |

이 matrix의 Parse response와 limits는 공식 UpstageAI GitHub reference에 직접 명시되어 있습니다. fileciteturn1file0 fileciteturn3file0 fileciteturn9file0 fileciteturn12file0

Enhanced Parse는 Standard의 단순 OCR/layout extraction을 넘어 VLM 기반 visual understanding을 추가합니다. Upstage는 복잡하거나 borderless/multi-page table, chart의 structured data와 자연어 설명, image/diagram description, checkbox state 등을 Enhanced의 주요 대상으로 발표했습니다. citeturn11search2

특히 Unfold의 Semantic Document View에는 Parse의 아래 category가 거의 그대로 활용 가능합니다.

```text
heading1/2/3 -> h1/h2/h3
paragraph    -> p
list         -> ul/ol + li
table        -> table
figure       -> figure
caption      -> figcaption
footnote     -> aside / linked footnote
equation     -> math container
```

다만 **"Parse HTML = 접근성 완성본"으로 보면 안 됩니다.** Unfold에서 `aria-label`, 표 header scope, figure의 alt description, keyboard focus, citation anchor 등을 후처리해야 합니다. 각 DOM node에 다음 metadata를 삽입하면 Document View와 Source View를 같은 데이터 모델로 연결할 수 있습니다.

```html
<p
  data-source-id="file_abc:p4:e37"
  data-page="4"
  data-element-id="37"
  data-polygon="..."
>
  ...
</p>
```

**Parse 성능의 공식 benchmark도 존재합니다.** Upstage의 DP-Bench는 200개 샘플로 구성되며 Library of Congress 90개, OER 90개, Upstage 내부 20개를 사용하고 NID, TEDS, TEDS-S와 처리 시간을 비교합니다. citeturn5view1

2026-02-09 공개 leaderboard 기준 주요 결과는 다음과 같습니다. citeturn5view1

| Parser | TEDS | TEDS-S | NID | 평균 시간 |
|---|---:|---:|---:|---:|
| Upstage Standard | **96.06** | 97.25 | 96.29 | 3.77s |
| Upstage Enhanced | 95.59 | **97.62** | **96.62** | 7.56s |
| AWS | 95.48 | 96.99 | 95.97 | 7.95s |
| LlamaParse | 90.73 | 93.20 | 90.53 | 10.88s |
| Unstructured | 80.26 | 89.51 | 91.78 | 6.80s |
| Microsoft | 77.85 | 85.74 | 87.03 | 3.39s |
| Google | 78.30 | 80.71 | 82.17 | 37.00s |

중요한 해석은 **Enhanced가 모든 metric에서 Standard를 이기는 것은 아니라는 점**입니다. Standard가 TEDS에서는 조금 높고 더 빠르며, Enhanced가 TEDS-S와 NID에서 조금 높습니다. 따라서 Unfold에서 모든 페이지를 Enhanced로 강제하기보다 **Auto 또는 Standard 기본 + 시각적으로 복잡한 페이지 Enhanced**가 비용과 속도 면에서 합리적입니다. 현재 가격도 Standard $0.01/page, Enhanced $0.03/page로 차이가 납니다. citeturn29view0

Upstage 제품 페이지는 Document Parse가 평균 약 0.6초/page, 100페이지를 1분 이내 처리할 수 있다고 설명하지만, 이는 제품 benchmark 수준의 주장이지 Unfold의 한국어 HWP workload SLA는 아닙니다. 실제 latency는 반드시 POC에서 다시 측정해야 합니다. citeturn4view3

## D-E. Classify, Extract, Instruct와 Studio Agent Workflow

**D. Classify / Extract / Instruct Capability Matrix**

| Capability | Classify | Extract | Instruct |
|---|---|---|---|
| standalone API | **O** | **O** | 별도 standalone endpoint 확인 안 됨 |
| Studio step | **O** | **O** | **O, Beta** |
| 입력 목적 | 문서 종류 판단 | 구조화 정보 추출 | 자유형 reasoning/Q&A |
| 사용자 정의 schema | class taxonomy | JSON Schema | optional structured output |
| custom class | **O** | 해당 없음 | prompt로 가능 |
| confidence | **0.0~1.0** | **high/medium/low** | native confidence 없음 |
| multi-document split | **O** | **O** | 없음 |
| page group 반환 | **O** | split 결과 | 없음 |
| key-value | 해당 없음 | **O** | 가능하지만 Extract 권장 |
| list | 해당 없음 | **O** | O |
| table | 해당 없음 | **array<object>** 권장 | 자유형 |
| 비정형 조건 | class description으로 판단 | **O** | **O** |
| 기한 | 분류 목적 아님 | **O** | O |
| 필요 서류 | 분류 목적 아님 | **O, array** | O |
| checkbox | visual cue로 분류 가능 | **O** | context 의존 |
| signature | 분류 cue 가능 | **O** | context 의존 |
| source coordinates | 없음 | **O** | native evidence 좌표 확인 안 됨 |
| word-level source | 없음 | Studio Extract에서 **O** | 없음 |
| previous-step context | routing source | Parse 이후 실행 | **자동 전달** |
| 조건 분기 source | **공식 지원** | 제한적/불명확 | 불명확 |
| 여러 문서 종합 | 문서별 가능 | 문서별/split 가능 | **POC 필요** |
| 외부 action 호출 | 없음 | 없음 | generic tool/HTTP 호출 미확인 |

Classify standalone API는 root가 `string`인 JSON Schema에서 `oneOf`와 각각의 `const`, `description`으로 taxonomy를 정의합니다. 결과에는 class뿐 아니라 `confidence_score`와 page 범위가 포함될 수 있습니다. `split=true`를 주면 한 PDF의 여러 문서를 별도 group으로 분리할 수 있습니다. fileciteturn7file0

따라서 다음과 같은 Unfold 전용 taxonomy는 공식 기능 위에서 구현할 수 있습니다.

```json
{
  "type": "string",
  "oneOf": [
    {
      "const": "core_notice",
      "description": "지원 사업의 핵심 공고 또는 모집 요강"
    },
    {
      "const": "eligibility_rules",
      "description": "지원 자격, 소득 기준, 선발 기준을 설명하는 문서"
    },
    {
      "const": "application_form",
      "description": "사용자가 작성하거나 제출해야 하는 신청서 양식"
    },
    {
      "const": "reference",
      "description": "사업과 관련 있지만 핵심 지원 조건은 없는 참고 자료"
    },
    {
      "const": "irrelevant",
      "description": "현재 공고의 지원 여부 판단과 관계없는 문서"
    }
  ]
}
```

이렇게 하면 **여러 첨부문서 relevance filtering 자체는 가능**합니다. 다만 `confidence_score=0.91`은 "공고와 91% semantic similarity"라는 의미가 아니라 **선택한 class에 대한 분류 confidence**입니다. 따라서 relevance **ranking**까지 필요하면 Embed/File Search/RAG 단계가 별도로 필요합니다. Classify는 routing과 filtering에 더 적합합니다. 공식 자료도 Classify의 역할을 downstream schema와 workflow route 선택으로 설명합니다. citeturn30search3 fileciteturn7file0

한 파일 안의 여러 문서를 자동 분리하는 것도 현재는 **Classify 자체에서 공식 지원**됩니다. Studio에서는 `split=true`일 때 page를 classification 결과별 group으로 나누고, 각 split group이 조건에 맞는 다음 step을 독립적으로 지나갑니다. fileciteturn9file0

Upstage는 Document Classify의 자체 영어/한국어 보험문서 평가에서 **taxonomy가 문서 유형을 충분히 포함한 조건에서 92.1% accuracy**를 발표했습니다. 별도 Studio 보험 workflow 자료에는 95%+ 분류 정확도 사례도 나오지만, 후자는 통제된 범용 benchmark로 보기보다는 use-case 수치로 해석하는 편이 안전합니다. citeturn16view3turn24view2

**Extract**는 schema 기반입니다. standalone Information Extraction API는 OpenAI SDK-compatible interface에서 `response_format.type=json_schema`를 사용하며, `information-extract` 모델이 schema에 맞는 JSON string을 반환합니다. sync와 async가 모두 있습니다. fileciteturn6file0

Studio Agent의 Extract에서는 다음과 같이 조건과 필요 서류 같은 자유형 정보를 schema에 넣는 것이 가능합니다.

```json
{
  "type": "object",
  "properties": {
    "program_name": {
      "type": "string"
    },
    "deadline": {
      "type": "string"
    },
    "eligibility_conditions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "required_documents": {
      "type": "array",
      "items": { "type": "string" }
    },
    "cautions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "selection_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "criterion": { "type": "string" },
          "detail": { "type": "string" }
        }
      }
    }
  }
}
```

Studio reference는 top-level primitive와 array, array-of-object 형태를 허용하며 최대 depth에도 제약이 있습니다. standalone Extract와 Studio Agent Extract의 schema 제약 설명에는 세부 차이가 있으므로 **동일 schema가 양쪽 API에서 완전히 동일하게 동작한다고 가정하지 않는 것이 좋습니다.** fileciteturn6file0 fileciteturn9file0

정보가 표 형태가 아니더라도 `description`을 충분히 작성하면 "지원 대상", "중복수혜 제한", "소득조건", "선발제외 조건" 같은 의미 단위를 추출 대상으로 정의할 수 있습니다. Upstage는 Information Extract를 template/retraining 없이 임의 schema에 맞춘 JSON extraction 용도로 공식 소개하고 있습니다. citeturn16view0turn23search5

Source Grounding 측면에서는 Extract가 특히 강합니다. standalone API의 `location` 옵션과 Studio Agent의 `location`, `location_granularity`가 존재하고, Studio 기준 기본 granularity 옵션은 `all`, `element`, `word`입니다. confidence 역시 `high`, `medium`, `low`로 반환하도록 설정할 수 있습니다. fileciteturn9file0

Upstage가 Location Coordinates 기능을 공개하면서 **추출값마다 page와 위치를 연결해 원문에서 검증할 수 있다**고 명시했습니다. citeturn30search6turn30search15

**Instruct**는 2026년 현재 Studio의 네 번째 core Document AI capability입니다. 공식 설명은 "문서를 요약하고, 번역하고, 질문에 답한다"입니다. 현재 가격 페이지에서는 Instruct가 **Beta이며 자연어 prompt를 사용하는 custom LLM step**으로 표시됩니다. citeturn24view0turn32search0

Studio step reference에서 더 중요한 점은 **앞 step의 결과가 자동으로 Instruct context로 전달된다**는 것입니다.

```text
Parse      → Instruct
Classify   → Instruct
Extract    → Instruct
Instruct   → Instruct
```

별도 glue code 없이 `next_steps`로 연결하면 된다고 공식 reference가 설명합니다. Instruct에는 자유형 `input`과 optional structured output schema를 줄 수 있습니다. fileciteturn9file0

따라서 "이 학생이 조건을 충족하는가?", "신청 전에 주의할 점을 요약해줘" 같은 판단형 task는 **기술적으로 가능**합니다. 다만 eligibility를 고신뢰 업무 규칙으로 써야 한다면 다음처럼 분리하는 편이 좋습니다.

```text
Extract
  ↓
객관적 rule facts
  ↓
deterministic rules where possible
  ↓
Instruct / Solar
  ↓
설명, 예외조건, 자연어 답변
```

예를 들어 `GPA >= 3.0`, `deadline > now`처럼 기계적으로 판정 가능한 것은 애플리케이션에서 계산하고, "경제사정이 곤란한 학생 우대"처럼 해석이 필요한 문장은 Instruct/Solar가 근거와 함께 설명하게 하는 구조가 안정적입니다.

**E. Studio Agent Workflow 구조**

2026년 공식 API reference에서 Studio Agent의 내부 모델은 다음과 같습니다. fileciteturn8file0

```text
Agent
  └─ Config
       └─ Steps / DAG
            └─ Job
                 ├─ File
                 └─ per-step Results
```

`Agent`는 실행 단위, `Config`는 workflow definition, `Step`은 Parse/Classify/Extract/Instruct, `Job`은 실제 실행 instance입니다. Studio UI에서 workflow를 만든 뒤 `agt_xxx`를 애플리케이션에서 호출할 수도 있고, Agent와 Config를 API로 직접 생성할 수도 있습니다. fileciteturn8file0

공식 ordering rule은 상당히 구체적입니다.

```text
Document Parse는 반드시 첫 step

Parse → Classify → Extract

Instruct는 Parse 이후 어느 위치든 삽입 가능

예:
Parse → Instruct

Parse → Extract → Instruct

Parse → Classify → Extract → Instruct

Parse → Classify → Instruct → Extract
```

fileciteturn10file0

조건 분기도 명시적으로 지원합니다.

```json
"next_steps": [
  {
    "step_name": "extract-eligibility",
    "condition": {
      "field": "document_type",
      "operator": "==",
      "value": "eligibility_rules"
    }
  },
  {
    "step_name": "extract-default"
  }
]
```

지원 operator는 `==`, `!=`, `in`, `not in`, `contains`이며 condition이 없는 next step을 fallback으로 둘 수 있습니다. fileciteturn10file0

Unfold용으로는 다음 Agent가 가장 자연스럽습니다.

```text
Parse
  │
  ▼
Classify(split=true)
  │
  ├─ core_notice
  │      └─ Extract: title/deadline/benefit/application
  │
  ├─ eligibility_rules
  │      └─ Extract: conditions/exclusions/exceptions
  │
  ├─ application_form
  │      └─ Extract: required fields/submission checklist
  │
  ├─ reference
  │      └─ Instruct: short relevance summary
  │
  └─ irrelevant
         └─ end
```

Studio Agent는 애플리케이션에서 다음 식으로 실행됩니다. fileciteturn8file0turn11file0

```text
POST /v2/files
     ↓ file_id

POST /v2/responses
     model = agt_xxx
     input_file = file_id
     ↓ job_id

GET /v2/responses/{job_id}
     ↓
queued / in_progress / completed / failed
```

동기와 background 방식이 모두 문서화되어 있습니다. `background:true`이면 Job ID를 즉시 받고 polling하며, `agt_` Agent는 background execution을 사용합니다. fileciteturn8file0turn11file0

`include=["all"]`을 사용하면 최종 step만이 아니라 **각 step 결과를 모두 받아 디버깅**할 수 있습니다. API에서 job별 `parse`, `classify`, `extract`, `instruct` 결과를 필터링해 조회하는 것도 가능합니다. fileciteturn11file0

실패 상태는 `failed`이며 error code에 `parse_error`, `preprocess_error`, `classify_error`, `extract_error`, `instruct_error`, `tool_execution_error`, `server_error`, `job_timeout_error` 등이 정의돼 있습니다. Studio Job 전체 timeout은 공식 reference상 **1시간**입니다. fileciteturn11file0

다만 retry는 별도 workflow-node 옵션이나 `retry_count`가 문서화된 형태가 아니라, 해당 error들에 대해 **client가 Job을 재실행하는 방식**이 권장됩니다. 동일 file과 동일 step settings에는 7-day cache가 적용되는 것으로 현재 reference에 명시되어 있습니다. fileciteturn11file0

**External Integration은 주의가 필요합니다.** 현재 공개 Agent Config의 step type은 `document-parse`, `document-classify`, `information-extract`, `instruct` 네 가지뿐이며, generic HTTP/REST-call node는 공식 v2 step 목록에서 발견되지 않았습니다. fileciteturn8file0turn9file0

Studio 제품 페이지는 REST API와 connectors를 integration 수단으로 소개하지만, MCP와 Webhooks에는 coming-soon 표시가 있습니다. 따라서 **현재 해커톤 구현을 Studio 내부 Webhook이나 arbitrary REST node에 의존해서는 안 됩니다.** External Integration은 `Studio Agent API → Unfold backend → 외부 서비스` 구조로 잡는 편이 확실합니다. citeturn4view2

예를 들어:

```text
Studio Extract: deadline
       ↓
Unfold Backend
       ↓
Google Calendar API
       ↓
"신청 마감일 추가"
```

이렇게 해도 Upstage Agent는 문서 이해와 의사결정 데이터 생성이라는 핵심 역할을 담당하고, External Integration은 실제 제품 application layer에서 수행됩니다.

Studio 웹 UI 자체는 workflow의 speed, stability, accuracy, step success/error 등을 실시간 모니터링하는 기능을 공식적으로 소개합니다. API 측에서는 streaming progress percentage나 webhook보다 **polling과 job status가 현재 명시된 방식**입니다. citeturn24view2 fileciteturn11file0

## F-G. Source Grounding과 다중 문서 권장 Architecture

**F. Source Grounding 구현 가능성**

Unfold의 가장 중요한 기술 차별점은 단순 Q&A가 아니라 **"답변 → 원문"의 역추적 가능성**입니다.

공식 API primitive를 기준으로 보면 다음과 같습니다.

| Grounding 요구 | 공식 API만으로 | 판정 |
|---|---|---|
| Extract value → page | 가능 | **Confirmed** |
| Extract value → coordinates | 가능 | **Confirmed** |
| Extract value → word-level location | Studio에서 가능 | **Confirmed** |
| Parse element → page | 가능 | **Confirmed** |
| Parse element → polygon | 가능 | **Confirmed** |
| Parse element → ID | 가능 | **Confirmed** |
| Instruct answer → source element | 공식 필드 확인 안 됨 | **Unclear** |
| Instruct answer → coordinates | 공식 필드 확인 안 됨 | **Unclear** |
| Solar answer → native Parse element citation | 자동 연결 기능 확인 안 됨 | **Unclear** |
| Answer → page citation | 자체 source metadata로 가능 | **Possible** |
| Answer → exact polygon | citation element를 역참조하면 가능 | **Possible** |

Parse element의 공식 구조는 다음 형태입니다. fileciteturn1file0

```json
{
  "id": 37,
  "category": "paragraph",
  "content": {
    "html": "...",
    "markdown": "...",
    "text": "..."
  },
  "page": 4,
  "coordinates": [
    {"x": 0.06, "y": 0.05}
  ]
}
```

따라서 Unfold가 아래 source record를 생성하면 됩니다.

```json
{
  "source_id": "bundle42:file3:p4:e37",
  "bundle_id": "bundle42",
  "file_id": "file3",
  "filename": "지원자격.pdf",
  "page": 4,
  "element_id": 37,
  "category": "paragraph",
  "text": "신청일 기준 학부 재학생으로...",
  "polygon": [...],
  "original_url": "...",
  "page_image_ref": "..."
}
```

핵심은 **LLM에 polygon을 직접 이해시키는 것이 아니라 source ID만 보여주는 것**입니다.

예를 들어 retrieval 결과를 Solar에 다음처럼 전달합니다.

```text
[S:file3:p4:e37]
신청일 기준 학부 재학생으로 직전학기 성적이 3.0 이상이어야 한다.

[S:file3:p5:e11]
기초생활수급자 및 차상위계층은 성적 기준을 적용하지 않는다.
```

그리고 output을 강제로 다음처럼 만듭니다.

```json
{
  "answer": "일반 지원자는 직전학기 3.0 이상이어야 하지만, 기초생활수급자와 차상위계층에는 예외가 있습니다.",
  "citations": [
    "S:file3:p4:e37",
    "S:file3:p5:e11"
  ]
}
```

서버는 LLM이 반환한 citation이 **실제로 retrieved context에 존재하는 source ID인지 검증**한 뒤, 각 ID의 `page`와 `polygon`을 UI에 전달합니다.

이렇게 하면:

```text
Answer
  ↓
source_id
  ↓
file + page + element_id
  ↓
Parse polygon
  ↓
viewer highlight
```

가 성립합니다.

이는 Upstage가 native "answer bbox" API를 제공해야만 가능한 기능이 아닙니다. **Parse가 좌표와 ID를 제공하기 때문에 Unfold가 마지막 mapping layer만 소유하면 됩니다.** fileciteturn1file0

Extract 값은 더 쉽습니다.

```text
deadline
  value: "2026-09-15 17:00"
  confidence: high
  location:
      page: 2
      coordinates: ...
```

이 경우 LLM retrieval을 거치지 않고 Extract 결과 자체에서 source highlight를 만들 수 있습니다. Upstage는 Location Coordinates 기능의 목적을 원문에서 추출값을 즉시 검증하는 traceability로 설명합니다. citeturn30search6

Studio Extract의 `location_granularity="word"`까지 활용하면 **"페이지 단위 citation"보다 훨씬 좁은 highlight**를 구현할 여지가 있습니다. fileciteturn9file0

다만 Parse polygon의 좌표 contract에서 **정확한 coordinate unit, origin, page image와의 scaling 규칙**은 이번에 확보한 공식 reference에서 명시적으로 발견하지 못했습니다. sample 값이 0.x 형태이므로 normalized coordinate로 보이지만, 이것을 production contract로 단정해서는 안 됩니다. 이것이 Unfold의 P0 POC입니다.

특히 HWP/HWPX에서는 다음 조합을 검증할 가치가 큽니다.

```text
Studio HWP upload
      ↓
Studio-generated page image
      +
Parse polygon
      ↓
overlay
```

두 좌표계가 그대로 맞는다면 **HWP를 Chrome에서 렌더링하는 가장 어려운 문제를 Upstage page-image preprocessing이 사실상 해결**해 줍니다. Studio Files API가 페이지별 image URL을 공식적으로 노출한다는 점이 이를 가능하게 합니다. fileciteturn12file0

**G. 여러 문서 처리, Chat/RAG/Solar 권장 Architecture**

질문의 예시인

```text
공고 본문
공고.pdf
지원자격.pdf
신청서.hwp
```

는 **"하나의 파일을 split"하는 문제와 "여러 독립 파일을 하나의 context로 묶는 문제"를 구분해야 합니다.**

Classify `split=true`는 전자에 매우 적합합니다. 예를 들어 50페이지 PDF 안에 서로 다른 문서가 붙어 있으면 페이지별 group을 만들어 branch시킬 수 있습니다. fileciteturn7file0turn9file0

반면 독립 첨부파일 4개를 하나의 지식 단위로 만드는 것은 **Unfold가 `bundle_id`를 두고 묶는 방식**이 더 낫습니다.

권장 구조는 다음과 같습니다.

```text
Announcement Bundle
│
├─ web-page-body
│     └─ extension text extraction
│
├─ attachment A: 공고.pdf
│     └─ Studio Agent
│
├─ attachment B: 지원자격.pdf
│     └─ Studio Agent
│
└─ attachment C: 신청서.hwp
      └─ Studio Agent
             │
             ▼
       Unified Source Store
```

각 파일에 같은 Agent를 적용하되 Classify가 document role을 결정합니다.

```text
Parse
 ↓
Classify
 ├─ core_notice
 ├─ eligibility
 ├─ application_form
 └─ reference
 ↓
role-specific Extract
 ↓
element/source metadata store
```

그 뒤 bundle Q&A는 별도 layer로 수행합니다.

Upstage는 Document Parse의 공식 use case를 **RAG, search, unpredictable full-document Q&A**라고 명시하며, Information Extract는 반복되는 구조화 필드를 ERP/database/workflow에 넣는 용도라고 구분합니다. citeturn27search8turn23search5

따라서 Unfold는 둘 중 하나를 고르는 것이 아니라:

```text
Extract = 빠른 Overview / deterministic facts
Parse   = 검색 가능한 source corpus
Solar   = 자연어 Q&A / synthesis
```

로 역할을 나누는 편이 좋습니다.

현재 Solar Pro 4는 공식적으로 **512K context와 최대 128K output**, 한국어/영어/일본어 지원, agent-oriented reasoning을 제공합니다. 현재 가격은 input $0.30/1M tokens, cached input $0.06/1M, output $1.20/1M tokens입니다. citeturn27search10turn29view0

첨부가 3~5개이고 Parse 결과가 context window에 충분히 들어가는 해커톤 MVP에서는 vector DB 없이도 다음 전략이 가능합니다.

```text
Parse outputs
    ↓
source_id 붙이기
    ↓
필요 section 선별
    ↓
Solar Pro 4
    ↓
answer + source_ids
```

문서가 많아지면 RAG로 전환하면 됩니다. 현재 Upstage 가격 페이지에는 **File Search Beta**가 "자신의 문서를 대상으로 한 natural-language retrieval API"로 공개되어 있고, Embed 2도 별도 제공됩니다. 다만 File Search가 Unfold가 필요한 Parse `element_id/polygon` metadata를 그대로 보존하고 반환하는지는 이번 공식 자료에서 확인하지 못했습니다. Source Grounding이 제품 핵심이면 **초기에는 자체 vector store에 source metadata를 직접 보존하는 편이 위험이 적습니다.** citeturn29view0

Upstage는 과거 Solar 평가에서도 Document Parse로 원본 문서를 HTML로 바꾼 뒤 DocVQA/MP-DocVQA를 수행하는 방식을 공식 benchmark로 사용했습니다. 즉 **Document Parse → structured HTML/Markdown → Solar** 조합 자체는 Upstage가 공식적으로 검증해 온 패턴입니다. citeturn31search0

현재 ready-made document chat 제품은 **AI Space**입니다. AI Space는 답변에 visual highlight와 sentence-level citation을 붙이는 제품 경험을 공식적으로 제공하고 있습니다. 다만 AI Space를 Unfold의 embedded developer API로 직접 호출하는 구조까지는 이번에 공식적으로 확인하지 못했습니다. 따라서 AI Space는 **UX reference**, Studio/Document AI/Solar는 **구현 primitive**로 보는 것이 맞습니다. citeturn30search18

별도 current API capability로 **"Document Chat"이라는 독립 제품 endpoint는 이번 공식 자료에서 확인되지 않았습니다.** Unfold에서는 다음 선택이 가장 현실적입니다.

| Q&A 방식 | 장점 | 문제 | 추천 |
|---|---|---|---|
| Studio Instruct | Agent 안에서 가장 간단 | native citation 미확인, multi-file behavior POC 필요 | 1-document summary |
| Solar + 전체 Parse context | 구현 단순, 512K context | 아주 큰 bundle은 비용/길이 증가 | **Hackathon MVP 추천** |
| Solar + custom RAG | source metadata 완전 제어 | 구현량 증가 | **Unfold 완성형 추천** |
| File Search Beta + Solar | Upstage 활용 깊이 높음 | polygon metadata 보존 여부 POC | 추가 POC |
| AI Space | citation UX 완성도 높음 | 앱용 developer primitive 확인 안 됨 | UX benchmark |

최종적으로 Unfold의 Q&A 핵심은 **"LLM이 citation을 스스로 발명하지 못하게 하는 것"**입니다. Retrieval 단계에서 허용 source IDs를 정하고, answer 후 citation validator를 두는 것이 좋습니다.

## H-I. 운영 제한, 개인정보와 구현 가능 판정

**H. 개인정보 / Rate Limit / 가격 / 운영 제한**

먼저 API surface별 limit을 섞으면 안 됩니다.

| 영역 | 현재 공식 값 | 출처 |
|---|---|---|
| standalone Parse sync | 100 pages, 50 MB, 5분 timeout | fileciteturn1file0 |
| standalone Parse async | 1,000 pages, 50 MB | fileciteturn3file0 |
| Parse async batching | 최대 10 pages/batch | fileciteturn3file0 |
| Parse async result retention | 30일 | fileciteturn3file0 |
| Parse async download URL | 약 15분, status 재조회로 새 URL | fileciteturn3file0 |
| Studio v2 File | 500 MB, 1,000 pages | fileciteturn12file0 |
| Studio File default expiry | 30일 | fileciteturn12file0 |
| Extract sync | 100 pages | fileciteturn6file0 |
| Extract async | 1,000 pages | fileciteturn6file0 |
| Extract max schema properties | sync 100, async 5,000 | fileciteturn6file0 |
| Agent Enhanced Extract | 50 pages | fileciteturn9file0 |
| Studio Job timeout | 1시간 | fileciteturn11file0 |
| Studio identical-job cache | 7일 TTL | fileciteturn11file0 |

Async Parse는 webhook이 아니라 `request_id`를 받은 뒤 상태 API를 polling하는 구조입니다. 상태는 `submitted`, `started`, `completed`, `failed`로 정의돼 있습니다. fileciteturn3file0

Studio Agent 역시 background job 생성 후 `GET /v2/responses/{job_id}` polling 구조입니다. fileciteturn11file0

**현재 가격**은 다음과 같습니다. 모두 10% VAT 별도입니다. citeturn29view0

| API / Studio Step | 가격 |
|---|---:|
| Document Parse Standard | **$0.01/page** |
| Document Parse Enhanced | **$0.03/page** |
| standalone Document Classify | **$0.004/page** |
| standalone Information Extract Standard | **$0.04/page** |
| standalone Information Extract Enhanced | **$0.06/page** |
| Studio Parse Standard | **$0.01/page** |
| Studio Parse Enhanced | **$0.03/page** |
| Studio Extract Standard | **$0.03/page 추가** |
| Studio Extract Enhanced | **$0.05/page 추가** |
| Studio Classify | **현재 Beta 무료** |
| Studio Instruct | **현재 Beta 무료** |
| Solar Pro 4 input | **$0.30 / 1M tokens** |
| Solar Pro 4 cached input | **$0.06 / 1M tokens** |
| Solar Pro 4 output | **$1.20 / 1M tokens** |

Studio에서는 여러 step을 쓰면 해당 step 비용이 합산되며 Parse는 한 번만 과금합니다. 공식 예시로 `Parse + Classify + Extract Standard`는 현재 $0.04/page입니다. citeturn29view0

따라서 20페이지짜리 공고 bundle을 전부 Standard Parse + Studio Extract로 처리하면 대략:

`20 × ($0.01 + $0.03) = $0.80`

수준입니다. 여기에 Enhanced page와 Solar token 비용이 추가됩니다. 이는 현재 공개 단가를 사용한 단순 계산입니다. citeturn29view0

Studio Agent는 각 Agent에 **10 free runs**를 제공한다고 현재 pricing page에 명시되어 있습니다. citeturn29view0

Rate limit은 commitment tier에 따라 달라집니다. 현재 가격 페이지에서 Information Extract의 예시는 Tier 1 **10 req/sec**, Tier 2 **20 req/sec**, Tier 3 **40 req/sec**이며 Solar는 예시 기준 30/50/80 req/sec 수준입니다. Document Parse/Classify의 현행 전체 model별 exact limit은 링크된 Console rate-limit table에 의존하며, 이번 공개 crawler 결과에서는 숫자를 확정하지 못했습니다. 따라서 구현은 429를 정상적인 operational state로 취급해야 합니다. citeturn28view0

Studio jobs reference도 rate-limit error에 대해 wait-and-retry를 권장합니다. 별도 공개 concurrency 숫자는 확인되지 않았으므로 **RPS와 background-job queue를 concurrency SLA로 해석하면 안 됩니다.** fileciteturn11file0

개인정보 측면에서 2026-07-01 적용 약관은 유료 서비스를 이용하는 Member의 Input/Output Data에 대해 **회원에게 권리가 남으며**, 서비스 제공/운영상 필요한 경우를 제외하면 저장하지 않고, **별도 사전 동의가 없는 한 서비스 개선이나 AI 모델 학습에 사용하지 않는다**고 규정합니다. citeturn28view3

반면 **완전 무료로 제공되는 서비스에는 예외**가 있습니다. 약관은 무료 서비스의 Input/Output Data가 서비스 개선과 AI 연구, training에 사용될 수 있다고 명시합니다. 다만 유료 전환을 전제로 일시적으로 무료 제공되는 promotion은 해당 무료 서비스 예외에서 별도로 다룹니다. Junction 참가자 credit이 정확히 어느 범주에 속하는지는 계정에 적용되는 조건을 확인해야 합니다. citeturn28view3

따라서 Unfold 데모에서도 **학생이 작성한 신청서, 주민등록번호가 들어간 증빙, 소득자료를 자동 업로드 대상으로 삼지 않는 것이 좋습니다.** 초기 제품 범위를 공개 공고와 빈 신청양식까지만 제한하는 것이 개인정보 리스크를 크게 줄입니다. 약관상 타인의 개인정보를 서비스에 입력할 경우 필요한 법적 조치를 취할 책임은 회원에게 있습니다. citeturn28view3

Studio File은 명시적으로 expiry를 지정할 수 있고 기본값은 30일이며, `DELETE /v2/files/{file_id}` API도 존재합니다. Job 역시 delete API가 있습니다. 따라서 Unfold는 **처리 완료 후 source metadata만 자체 DB에 남기고 Upstage file/job을 명시적으로 삭제하는 retention policy**를 설계할 수 있습니다. fileciteturn12file0turn11file0

Studio 제품은 SOC 2 Type I, ISO 27001/27701, HIPAA compliance와 RBAC, audit log, workflow traceability, data-retention controls를 공식적으로 소개합니다. citeturn4view2

**I. Unfold 기능별 Confirmed / Possible / Unclear / Impossible**

여기서 `Impossible`은 "기술적으로 영원히 불가능"이 아니라 **2026-08-22 현재 공개된 Upstage API surface에서 요청한 형태로 제공되지 않는다**는 뜻입니다.

| Unfold 기능 | 상태 | 구현 방식 / 제한 |
|---|---|---|
| 웹페이지에서 첨부파일 탐지 | **Possible** | Chrome Extension 자체 기능 |
| PDF 직접 Parse | **Confirmed** | API/Studio |
| HWP 직접 업로드 | **Confirmed** | 자동 변환 |
| HWPX 직접 업로드 | **Confirmed** | 자동 변환 |
| DOC 직접 standalone Parse | **Impossible 현재 API** | Studio v2 File 경로는 가능 |
| DOC Studio 처리 | **Confirmed** | v2 Files |
| PPT Studio 처리 | **Confirmed** | v2 Files |
| XLS Studio 처리 | **Confirmed** | v2 Files |
| HTML 직접 Parse | **Impossible 현재 API** | text 추출 또는 PDF render 필요 |
| 문서 구조/heading/list | **Confirmed** | element category |
| 표 구조 | **Confirmed** | HTML/table element |
| multi-page table | **Confirmed** | merge option |
| merged-cell 완전 fidelity | **Unclear** | POC |
| 이미지/수식/차트 | **Confirmed** | figure/equation/chart |
| checkbox | **Confirmed** | Enhanced |
| signature를 Parse element로 검출 | **Unclear** | Extract에서 signature extraction은 가능 |
| 각주 | **Confirmed** | footnote element |
| page number | **Confirmed** | element page |
| element polygon | **Confirmed** | coordinates |
| stable global element ID | **Unclear** | response-local ID는 존재 |
| accessible Semantic HTML | **Possible** | HTML 후처리 필요 |
| schema-based conditions/deadline extraction | **Confirmed** | Information Extract |
| Extract field source highlight | **Confirmed** | location |
| Extract confidence | **Confirmed** | high/medium/low |
| custom document class | **Confirmed** | oneOf taxonomy |
| 한 PDF auto splitting | **Confirmed** | Classify split |
| 첨부 relevance classification | **Possible** | custom taxonomy |
| relevance ranking | **Possible** | retrieval/embedding 추가 |
| Classify 기반 workflow branch | **Confirmed** | next_steps.condition |
| Parse→Extract→Instruct chain | **Confirmed** | Studio |
| Parse→Classify→Extract→Instruct | **Confirmed** | Studio |
| Studio workflow API 실행 | **Confirmed** | Agent API v2 |
| Studio workflow API 생성 | **Confirmed** | Agent/Config API |
| async/background 실행 | **Confirmed** | Job API |
| API 상태 조회 | **Confirmed** | polling |
| 실패 stage 구분 | **Confirmed** | error code |
| node 자동 retry 설정 | **Unclear** | client retry 권장 |
| real-time progress percentage | **Unclear** | status polling은 확인 |
| Studio 내부 arbitrary HTTP node | **Impossible 현재 공개 step set** | app backend에서 호출 |
| webhook 완료 callback | **Unclear / 현재 미제공으로 판단** | 제품 페이지에서 coming soon |
| single-document Instruct Q&A | **Confirmed** | Instruct |
| multi-attachment cross-document Instruct | **Unclear** | 반드시 POC |
| Solar cross-document Q&A | **Possible** | parsed context/RAG |
| answer → page citation | **Possible** | custom source IDs |
| answer → exact polygon | **Possible** | citation resolver |
| Instruct native grounding citation | **Unclear** | 공식 evidence 필드 없음 |
| HWP source visual highlight | **Possible, 매우 유망** | Studio page image + Parse polygon POC |
| 100페이지 이상 | **Confirmed** | async/Standard 최대 1,000 |
| 1,000페이지 초과 | **Impossible 단일 job 기준** | 문서 분할 필요 |

## J-K. 반드시 직접 POC할 항목과 심사 기준 Mapping

**J. 반드시 직접 POC해야 하는 항목**

공식 문서만으로 더 이상 확정할 수 없는 부분은 아래 순서로 검증하는 것이 좋습니다.

| 우선순위 | POC | 통과 기준 | 이유 |
|---|---|---|---|
| **P0** | HWP/HWPX 20개 direct upload | upload/parse 성공률 **≥95%**, 실패 시 fallback 가능 | Unfold의 한국 시장 차별점 |
| **P0** | Parse polygon → page image overlay | 올바른 page **100%**, target text highlight **≥95%** | 핵심 Source Grounding |
| **P0** | PDF polygon → PDF.js coordinate 변환 | citation page 100%, highlight hit ≥95% | 답변 click UX 핵심 |
| **P0** | Extract `location_granularity=word` | gold field source hit **≥95%** | exact evidence UX |
| **P0** | Instruct가 Parse metadata를 얼마나 보존하는지 | native element ID/location 존재 여부 확인 | native citation 가능성 최종 판정 |
| **P0** | 여러 file을 한 Agent Job에 넣은 Instruct | 4-document synthesis 정상 여부 | multi-doc native 경로 결정 |
| **P1** | Classify relevance | attachment 50개, macro-F1 **≥0.90** | 불필요 파일 제거 |
| **P1** | Classify split | mixed PDF 10개, page boundary F1 **≥0.95** | bundled 공공 PDF 대응 |
| **P1** | 조건/기한/서류 Extract | field exact/F1 **≥0.90** | 핵심 정보 정확도 |
| **P1** | multi-page/merged table | gold cell 구조 일치 **≥90%** | 장학/지원사업 표 대응 |
| **P1** | 30개 cross-doc Q&A | answer correctness ≥90%, citation precision ≥95% | 전체 사용자 가치 검증 |
| **P1** | hallucinated source ID 방어 | invalid citation rate **0%** | 신뢰성 |
| **P1** | 150페이지 async | failure recovery 성공, P95 latency 기록 | 운영성 |
| **P1** | 429/5xx retry | duplicate job/data corruption **0건** | demo 안정성 |
| **P2** | DOC/PPT/XLS Studio upload | legacy sample 성공률 측정 | bonus format |
| **P2** | Semantic HTML accessibility | keyboard/heading/table navigation manual pass | accessibility 차별점 |
| **P2** | file deletion/expiry | DELETE 후 재접근 불가 확인 | privacy demo |

특히 해커톤 전에 가장 먼저 돌릴 실험은 **HWP → Studio page image → Parse polygon overlay**입니다. 이 하나가 성공하면 "HWP를 브라우저에서 어떻게 보여줄 것인가"와 "원문 evidence를 어떻게 표시할 것인가"라는 두 어려운 문제를 동시에 해소할 가능성이 큽니다. Studio가 파일 upload 후 page-image conversion을 수행하고 Parse가 polygon을 반환한다는 primitive 자체는 공식적으로 확인됩니다. fileciteturn12file0turn1file0

두 번째 핵심 실험은 **Instruct native grounding**입니다. 현재 reference에는 이전 step context 자동 연결은 있으나 source citation 반환 contract가 없습니다. POC에서 결과가 실제로 source metadata를 보존한다면 architecture를 단순화할 수 있고, 그렇지 않으면 처음부터 custom citation resolver를 유지해야 합니다. fileciteturn9file0

세 번째는 **Studio Agent를 single source of truth로 쓸지, Document APIs를 개별 호출할지**입니다. 해커톤의 평가 포인트를 고려하면 Agent Config를 실제로 배포하고 API에서 호출하는 편이 Upstage 활용 깊이를 더 명확하게 보여줄 수 있습니다. Studio는 공식적으로 "모든 agent가 자체 API endpoint를 갖는다"고 설명합니다. citeturn29view0

정확도 평가는 단순히 "AI 답변이 좋아 보인다"로 끝내지 않는 것이 좋습니다. demo corpus를 미리 만들고 다음 네 지표를 dashboard에 노출하면 구현 정확도를 객관화할 수 있습니다.

```text
Field Extraction F1
Citation Page Accuracy
Citation Highlight Hit Rate
Question Answer Accuracy
```

추천 최소 demo corpus는 **20개 공고, 50개 첨부파일, 30개 사용자 질문**입니다.

예를 들어 심사 시 다음 수치가 나오면 설명력이 높습니다.

```text
HWP/HWPX parse success        19 / 20
Core field extraction F1      93.4%
Citation page accuracy        100%
Citation highlight hit        96.8%
Q&A correctness               28 / 30
Invalid source citation       0 / 73
Median end-to-end latency     8.4s
```

수치 자체보다 **직접 만든 gold set과 평가 루프가 있다는 것**이 중요합니다.

**K. JunctionX Korea 2026 심사 기준과 Mapping**

Junction 공식 이벤트 페이지에서 JunctionX Korea 2026은 **2026년 8월 21일부터 23일까지 진행되는 행사**이며, Upstage가 Track Partner로 발표된 사실도 Junction 공식 채널에서 확인됩니다. citeturn12search5turn13search1

다만 이번 조사에서 공개 웹에 인덱싱된 Junction/Upstage 공식 페이지 중 **"Upstage Studio/API 활용 깊이, Agent 구성, External Integration, 구현 난이도, 구현 정확도"라는 다섯 평가 문구를 그대로 담은 공개 문서**는 찾지 못했습니다. 따라서 아래 mapping은 질문에서 제공한 **현장 공식 발표 기준을 전제로** 작성합니다.

| 평가 항목 | Unfold에서 보여줄 구현 | 설득 포인트 |
|---|---|---|
| **Upstage Studio/API 활용 깊이** | Studio Agent v2, Parse, Classify, Extract, Instruct, Solar | 단일 API 호출 데모가 아니라 각 capability를 명확한 역할에 사용 |
| **Agent 구성** | Parse → Classify → conditional Extract → Instruct | 실제 DAG, split, class-dependent schema |
| **External Integration** | Chrome Extension + Unfold backend + deadline/calendar action | Document AI 결과가 실제 사용자 action까지 연결 |
| **구현 난이도** | HWP/HWPX, multi-file bundle, coordinate viewer, source grounding | 단순 PDF 요약보다 훨씬 높은 system integration 난이도 |
| **구현 정확도** | field F1, citation page accuracy, polygon hit rate, QA accuracy | "LLM이 잘한다"가 아니라 측정 가능한 검증 |

**Upstage 활용 깊이**는 단순히 API 종류를 많이 부르는 것으로 보여주기보다 각 component가 왜 필요한지를 설명하는 편이 좋습니다.

```text
Parse
"문서 전체 구조를 보존한다"

Classify
"어떤 문서인지 판단하고 workflow를 분기한다"

Extract
"deadline, 조건, 서류를 deterministic JSON으로 만든다"

Instruct
"문서 기반 reasoning을 수행한다"

Solar
"여러 문서를 종합하는 자연어 interface를 만든다"
```

Studio가 현재 공식적으로 네 Document AI capability를 하나의 Agent에 결합한다고 설명하는 구조와 정확히 대응합니다. citeturn24view0

**Agent 구성** 측면에서는 `Classify → branch`를 실제로 보여주는 것이 중요합니다. Upstage Studio는 보험 automation 사례에서도 `Parse → Classify → Extract`, 그리고 분류 결과마다 다른 extraction schema를 적용하는 구조를 공식 reference pattern으로 소개합니다. citeturn24view2

Unfold에서는 이를 장학/지원 공고로 바꾸면 됩니다.

```text
지원자격.pdf
    ↓ eligibility_rules
Eligibility Schema

신청서.hwp
    ↓ application_form
Application Schema

안내지도.pdf
    ↓ irrelevant/reference
Skip or short summary
```

**External Integration**은 현재 Studio 내부 arbitrary HTTP node가 공식적으로 확인되지 않으므로 억지로 Studio 안에서 구현하기보다 Chrome Extension 자체를 핵심 integration으로 제시하는 것이 더 정확합니다. Extension이 실제 대학/공공기관 사이트를 읽고, Studio Agent endpoint를 호출하고, 결과로 웹 UI를 재구성하는 것 자체가 이미 강한 external application integration입니다. 추가로 Extract된 deadline을 Calendar에 넣는 액션을 붙이면 end-to-end value가 더 분명해집니다.

**구현 난이도**에서는 다음 세 가지를 demo에서 반드시 시각화하는 것이 좋습니다.

```text
HWP도 된다
    ↓
복잡한 문서를 Semantic View로 바꾼다
    ↓
답변을 누르면 정확한 원문 위치가 빛난다
```

이 세 장면은 단순 "PDF Chat"과 Unfold를 가장 명확하게 구분합니다.

**구현 정확도**에서는 Upstage 공식 DP-Bench를 배경 근거로 제시하되, 이를 Unfold 정확도라고 오인시키면 안 됩니다. DP-Bench는 parser benchmark입니다. Unfold 자체는 실제 한국 대학/공공기관 공고로 별도 gold-set 평가를 보여주는 것이 좋습니다. Upstage의 최신 공개 DP-Bench에서 Standard/Enhanced가 주요 문서 parser들과 경쟁력 있는 TEDS/TEDS-S/NID를 보인다는 점은 **"왜 document-specific parsing layer를 두는가"**에 대한 객관적 근거가 됩니다. citeturn5view1

범용 multimodal LLM 대신 Document AI를 앞단에 두는 이유도 여기서 명확해집니다. 핵심은 "LLM보다 무조건 더 똑똑하다"가 아닙니다. **Document AI가 downstream agent에 필요한 구조적 계약을 제공한다는 점**입니다.

| 범용 multimodal LLM만 사용 | Document Parse/Extract를 앞단에 사용 |
|---|---|
| 답변은 가능 | 답변 + 구조화 data |
| source 위치가 불안정 | page + polygon |
| table reconstruction이 비결정적 | structured HTML/table |
| schema consistency를 prompt에 의존 | JSON Schema |
| confidence/field grounding 부족 | Extract confidence/location |
| 긴 문서 직접 context 비용 증가 | async parse + retrieval |
| source citation 후처리 어려움 | stable source record 생성 가능 |

Upstage가 Solar 자체의 structured-document QA 평가에서도 원문을 Document Parse를 이용해 HTML로 변환한 뒤 LLM에 입력하는 방식을 채택했고, Document Parse 제품 자체도 RAG/LLM preprocessing을 공식 use case로 두고 있다는 점이 이 architecture를 뒷받침합니다. citeturn31search0turn4view3

반대로 **Extract의 타사 대비 reproducible benchmark는 이번 조사에서 공식 공개 자료로 확정하지 못했습니다.** Classify에는 92.1% 자체 평가가 공개돼 있지만 범용 경쟁사와 같은 dataset에서 비교한 leaderboard가 아니며, Information Extract는 schema/location/confidence와 다양한 production 사례는 공개하지만 DP-Bench처럼 조건이 충분히 명시된 최신 competitor benchmark를 확인하지 못했습니다. 따라서 발표에서 Extract/Classify까지 "타사보다 몇 % 정확하다"고 확장해서 주장하는 것은 피하는 것이 좋습니다. citeturn16view3turn30search6

## L. 모든 핵심 주장별 출처

아래는 이번 판단에서 실제로 중요한 공식 자료만 정리한 source ledger입니다. 커뮤니티 글은 핵심 판정 근거로 사용하지 않았습니다.

| 핵심 주장 | 공식 출처 | 무엇을 확인했는가 |
|---|---|---|
| Document Parse의 역할, HTML/Markdown, table/chart/coordinate, 속도와 benchmark | Upstage Document Parse 제품 페이지 | Parse 제품 capability와 positioning citeturn4view3 |
| standalone Parse의 현재 입력 형식 | UpstageAI `upstage-extensions-hub`, Document Parse skill | PDF, 이미지, DOCX/PPTX/XLSX, HWP/HWPX fileciteturn1file0 |
| Parse response element structure | 같은 공식 GitHub reference | `id`, `category`, `page`, `coordinates`, element content fileciteturn1file0 |
| Parse element category | 같은 공식 reference | heading1/2/3, paragraph, list, table, figure, chart, equation, caption, footnote 등 fileciteturn1file0 |
| standalone sync/async limit | 같은 공식 reference | 100/1,000 pages, 50 MB, 5분 sync timeout fileciteturn1file0 |
| async polling/status/retention | UpstageAI async workflow reference | request_id, 10-page batch, 30일 result, 15분 URL fileciteturn3file0 |
| HWP/HWPX 자동 변환 | Upstage 공식 Document Parse 업데이트 | 직접 upload 후 자동 변환 citeturn11search21 |
| Studio가 DOC/PPT/XLS까지 수용 | UpstageAI Studio Files API reference | legacy Office 포함 formats, 500MB/1,000 pages fileciteturn12file0 |
| Studio가 page images 생성 | 같은 Files API reference | page별 `image_url`, status, index fileciteturn12file0 |
| Enhanced의 chart/image/checkbox capability | Upstage 공식 Enhanced 발표 | visual understanding 강화 citeturn11search2 |
| 최신 DP-Bench | Upstage 공식 DP-Bench dataset | 200 samples, metrics, parser leaderboard citeturn5view1 |
| Information Extract API | Upstage 공식 Information Extract 발표/reference | schema-aligned JSON, standalone API citeturn16view0 fileciteturn6file0 |
| Extract location | Upstage 공식 Location Coordinates 발표 | 추출값 source page/coordinates citeturn30search6 |
| Extract confidence/location granularity | UpstageAI Studio step reference | high/medium/low, all/element/word fileciteturn9file0 |
| Extract document splitting | Upstage 공식 Document Split 발표 | multi-document file split citeturn23search10 |
| Document Classify custom schema | UpstageAI Classify reference | oneOf taxonomy, confidence 0~1 fileciteturn7file0 |
| Classify split | 같은 reference | mixed PDF page grouping fileciteturn7file0 |
| Classify downstream routing | Upstage Classify 발표 | Extract schema/agent route 선택 citeturn30search3 |
| Classify 92.1% 평가 | Upstage Classify 발표 | 영어/한국어 보험문서 internal evaluation citeturn16view3 |
| Studio Agent의 실제 API 구조 | UpstageAI Studio skill | Agent/Config/Step/Job/File, v2 API fileciteturn8file0 |
| Studio workflow를 API로 생성 | UpstageAI Agents & Configs reference | POST Agent/Config APIs fileciteturn10file0 |
| Parse가 반드시 첫 step | 같은 reference | workflow ordering rule fileciteturn10file0 |
| 조건 분기 | 같은 reference | `next_steps.condition`, operators fileciteturn10file0 |
| Instruct automatic chaining | UpstageAI Step Types reference | Parse/Classify/Extract 결과 자동 context fileciteturn9file0 |
| Instruct가 Studio core capability | Upstage Studio AWS 공식 페이지 | summarize/translate/Q&A citeturn24view0 |
| Instruct Beta/가격 | 현재 Upstage pricing | Beta, free, custom LLM prompt step citeturn29view0 |
| Studio sync/background/polling | UpstageAI Jobs reference | `/v2/responses`, job polling fileciteturn11file0 |
| 실패 stage/error/timeout | 같은 reference | stage별 error code, 1시간 job timeout fileciteturn11file0 |
| Studio workflow API deployment | Upstage Studio 보험 사례 | Agent workflow를 API endpoint로 deployment citeturn24view2 |
| Studio monitoring | 같은 공식 사례 | speed/stability/accuracy/error monitoring citeturn24view2 |
| REST/connectors/Webhook 상태 | Upstage Studio 현재 제품 페이지 | REST/connectors, MCP/Webhook coming soon 표시 citeturn4view2 |
| 현재 API/Studio 가격 | Upstage 공식 Pricing | Parse, Extract, Classify, Instruct, Solar 단가 citeturn29view0 |
| current tier rate-limit 예시 | 같은 Pricing | IE 10/20/40 req/sec 등 citeturn28view0 |
| 데이터 소유권과 paid-data training 정책 | 2026-07-01 Upstage Terms | paid member I/O는 별도 동의 없이 training 사용 안 함 citeturn28view3 |
| 무료 서비스 데이터 예외 | 같은 Terms | free service의 improvement/training 예외 citeturn28view3 |
| Studio security/retention controls | Upstage Studio 제품 페이지 | RBAC, audit, retention controls, certifications citeturn4view2 |
| Parse와 Extract의 공식 역할 구분 | Upstage 공식 비교 가이드 | Parse는 search/RAG/Q&A, Extract는 structured automation citeturn27search8 |
| Document AI + Solar 조합 | Upstage Solar 공식 benchmark | Parse HTML을 이용한 document QA citeturn31search0 |
| Solar Pro 4 long context | Upstage Solar Pro 4 공식 발표 | 512K context, 128K output, agent focus citeturn27search10 |
| AI Space source citation UX | Upstage AI Space 제품 페이지 | visual highlights, sentence-level citations citeturn30search18 |
| JunctionX Korea 2026 일정 | Junction 공식 페이지 | 2026-08-21~23 행사 citeturn12search5 |
| Upstage Track Partner | Junction 공식 채널 | JunctionX Korea 2026 Upstage partnership citeturn13search1 |

**최종 기술 판정:** Unfold는 **"Chrome Extension + Upstage Studio Document Agent + custom Source Grounding + Solar Q&A" 구조라면 해커톤 범위를 넘어 실제 제품형 POC까지 구현 가능한 아이디어**입니다. 가장 큰 미확정점은 문서 파싱 자체가 아니라 **Instruct의 native citation 수준, Parse 좌표와 Studio page image의 정확한 좌표계 일치, 여러 독립 파일을 Instruct 하나에서 종합할 때의 실제 동작**입니다. 이 세 항목만 POC에서 빠르게 확정하면 전체 architecture의 불확실성이 크게 줄어듭니다. Parse의 element/page/polygon, Extract의 location/confidence, Classify의 split/branch, Studio v2 Agent API라는 핵심 primitive는 모두 현재 공식 자료에서 확인됩니다. fileciteturn1file0turn9file0turn10file0turn8file0