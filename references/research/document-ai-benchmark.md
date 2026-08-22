# Unfold용 Document AI 공정 Benchmark 설계: Upstage vs GPT, Gemini, Claude, Cloud Document AI

**핵심 결론부터 말하면**, 이 벤치마크는 "어느 모델이 문서를 가장 잘 읽는가?"가 아니라 다음 질문을 검증하도록 설계하는 것이 좋습니다.

> **"한국의 정확도 민감형 행정, 지원 문서에서, 원문 구조를 잃지 않고 근거를 추적하면서 지원 조건을 정확하게 판정하는 데 어떤 파이프라인이 가장 안전하고 경제적인가?"**

특히 Unfold에서는 OCR 평균 정확도보다 **잘못된 마감일, 누락된 필수 서류, 잘못된 자격 판정, 근거 없는 답변**이 더 큰 실패입니다. 따라서 단일 평균 점수보다 **Critical Error를 먼저 보여주고**, 그다음 구조 정확도, 의미 추출, 비용과 속도를 보는 방식이 적합합니다.

2026년 8월 22일 기준으로 비교 대상은 Upstage Document Parse와 Information Extract, OpenAI GPT-5.6 Sol, Gemini 3.7 Flash, Claude Opus 5를 핵심군으로 잡을 수 있습니다. GPT-5.6 Sol은 현재 OpenAI의 flagship GPT-5.6 모델이며 1.05M context와 image input을 지원하고, Gemini 3.7 Flash는 Google이 현재 가장 강력한 Flash multimodal 모델로 안내하고 있습니다. Claude Opus 5는 1M context를 지원하며 Anthropic의 PDF 처리 기능은 페이지마다 text와 image를 함께 처리합니다. citeturn16search0turn15search7turn15search6turn15search3

## 벤치마크 전제와 데이터셋

**A. Benchmark Hypothesis**

### 하나의 leaderboard보다 세 개의 Track이 필요합니다

Upstage Document AI와 GPT, Gemini, Claude는 애초에 같은 종류의 제품이 아닙니다. Upstage Document Parse는 문서 구조화에 특화되어 있고, Information Extract는 schema 기반 field extraction을 담당합니다. 반면 GPT, Gemini, Claude는 원본 PDF 자체를 보고 reasoning까지 수행할 수 있는 범용 multimodal 모델입니다. Azure Document Intelligence, Google Document AI, AWS Textract는 다시 parser 중심 서비스에 가깝습니다. Azure Layout은 text, text location, table, selection mark, structure를 반환하고, Textract 역시 tables, forms, queries, layout을 별도 feature로 제공합니다. citeturn17search22turn17search21

따라서 아래처럼 분리해야 합니다.

| Track | 질문 | 입력 | 출력 | 핵심 의미 |
|---|---|---|---|---|
| **P. Parse Fidelity** | 원문을 얼마나 정확히 구조화하는가? | 원본 문서 | text, blocks, tables, coordinates | parser 자체 비교 |
| **E. End-to-End Admin** | 실제 Unfold 업무를 얼마나 정확히 해결하는가? | 원본 문서 + 동일 task instruction | 조건, 마감일, 서류, 자격 판정, evidence | 실제 제품 대체 가능성 비교 |
| **C. Controlled Pipeline** | downstream reasoning을 고정했을 때 parser 차이가 얼마나 남는가? | 각 parser 출력 | 동일 LLM의 동일 JSON | parser 품질과 reasoning 품질 분리 |

**Track P에서는 GPT/Gemini/Claude에게도 동일한 canonical parse schema를 요구**합니다. "Markdown 하나 뽑아줘"가 아니라 blocks, order, heading, cells, spans, checkbox, page, bbox를 가능한 한 반환시키는 방식입니다.

**Track E에서는 각 회사가 권장하는 최선의 native 방식**을 씁니다.

예를 들면:

```text
Upstage:
Document Parse Auto/Enhanced
  -> Information Extract
  -> eligibility rule/reasoning

OpenAI:
Original PDF
  -> GPT-5.6 Sol
  -> Structured Output JSON

Gemini:
Original PDF
  -> Gemini 3.7 Flash
  -> Structured Output JSON

Claude:
Original PDF
  -> Claude Opus 5
  -> JSON

Azure / Google / AWS:
Document parser
  -> 동일 downstream reasoner
  -> JSON
```

OpenAI Responses API는 PDF를 입력받을 때 PDF text와 page image를 활용할 수 있고 GPT-5.6부터 PDF의 `auto` detail이 `high`로 동작합니다. Gemini는 공식 Document Understanding에서 PDF 최대 50MB 또는 1,000페이지를 처리한다고 안내합니다. Claude도 PDF 페이지를 text와 image 양쪽으로 처리하며 chart, table, visual layout 분석을 지원합니다. 즉 "범용 LLM은 PDF를 못 읽으므로 전문 parser가 당연히 유리하다"라는 전제로 시작하면 이미 불공정합니다. citeturn16search1turn15search0turn15search3

반대로 Upstage에는 범용 LLM에 없는 문서 특화 기능도 있습니다. 공식 자료상 Document Parse는 multi-page table stitching과 회전 문서 처리를 제공하며 `.hwp`, `.hwpx`를 업로드하면 자동 변환할 수 있습니다. Upstage OCR은 한글, 한자, 저품질 scan 지원을 명시합니다. 이 역시 **실제 벤치마크에서 확인해야 할 hypothesis이지 승리의 증거로 사용해서는 안 됩니다.** citeturn15search1turn15search4

### 검증할 가설

| ID | 사전 가설 | 반증 조건 |
|---|---|---|
| **H1** | 전문 Document AI가 reading order, table, merged cell, checkbox, coordinates 같은 deterministic structure에서 범용 LLM보다 강할 수 있다. | GPT/Gemini/Claude가 동일 GT에서 동등하거나 더 높은 구조 점수를 기록 |
| **H2** | GPT/Gemini/Claude가 조건 해석, 예외 조항, cross-page reasoning 같은 semantic task에서는 전문 parser보다 강할 수 있다. | Upstage native pipeline이 동일하거나 더 높은 semantic accuracy를 기록 |
| **H3** | clean digital PDF에서는 차이가 작고, scan, HWP, 복잡한 표, 긴 문서에서 제품 간 차이가 커질 수 있다. | document stratum별 성능 차이가 거의 없음 |
| **H4** | 어떤 하나의 제품도 20개 항목 전부에서 지배적이지 않을 가능성이 높다. | 한 provider가 거의 모든 stratum과 metric에서 일관되게 승리 |
| **H5** | Unfold에는 "최고 OCR"보다 **낮은 Critical Error + evidence grounding + 비용** 조합이 더 중요하다. | 높은 parser 점수가 실제 자격/기한/서류 오류 감소와 연결되지 않음 |

즉 최종 발표의 좋은 결론은 꼭 "Upstage 승"일 필요가 없습니다.

**"Upstage는 구조화 계층에서 가치가 있지만 reasoning은 Claude가 낫다"**, **"GPT 단독으로도 충분하다"**, **"Google Document AI + LLM 조합이 가장 싸고 정확하다"** 모두 유효한 결과입니다.

### 현재 비교 후보를 어떻게 고정할 것인가

| Provider | Benchmark configuration | 특기할 점 |
|---|---|---|
| **Upstage** | Document Parse Auto 또는 Enhanced + Information Extract | HWP/HWPX 변환, multi-page table 등을 공식 지원 citeturn15search1 |
| **OpenAI** | `gpt-5.6-sol` 또는 당시 고정된 canonical model ID | 1.05M context, image input, structured outputs 지원. PDF visual detail 옵션 존재 citeturn16search0turn16search16 |
| **Google** | `gemini-3.7-flash` | 현재 가장 capable Flash multimodal 모델, PDF 최대 1,000페이지/50MB citeturn15search7turn15search0 |
| **Anthropic** | `claude-opus-5` | 1M context, 128K max output, PDF의 text와 image 처리 citeturn15search6turn15search3 |
| **Azure** | Document Intelligence v4.0 Layout | v4.0이 현재 GA이며 text location, tables, selection marks, structure 제공 citeturn17search13turn17search22 |
| **Google Cloud** | Document AI Layout Parser + 필요 시 Form Parser | bounding boxes, image annotation, checkbox 구조화 가능 citeturn17search28turn17search5 |
| **AWS** | Textract AnalyzeDocument: TABLES + FORMS + QUERIES + LAYOUT | merged cells, selection elements, geometry 구조 제공 citeturn17search2turn17search6turn17search21 |

**Studio는 모델 accuracy 점수에 섞지 않는 것을 권합니다.** Studio가 Parse, Extract 등의 document workflow를 만드는 orchestration surface라면, Studio 자체를 GPT 한 번의 API call과 동일한 "모델"로 점수화하면 범주가 섞입니다. Studio는 **setup time, no-code 수정 시간, schema 변경 시간, debugging/observability** 같은 workflow metric으로 별도 평가하는 편이 공정합니다.

---

**B. Dataset 구성**

핵심은 **문서 수를 무작정 늘리지 않고 failure mode를 층화하는 것**입니다.

추천 발표용 Dataset은 **10~12개 source document**입니다.

| ID | 문서 유형 | 권장 크기 | 반드시 포함할 challenge |
|---|---|---:|---|
| D1 | 대학 장학금 공고 | 3~6p | 소득, 학점, 학년, 중복수혜 제한, 신청기한 |
| D2 | 다른 대학/기관 지원사업 | 4~8p | 예외조항, 조건부 제출서류 |
| D3 | 공공기관 PDF | 15~30p | 여러 페이지에 걸친 표 |
| D4 | HWP 또는 HWPX 공고 | 3~8p | native ingestion 여부도 평가 |
| D5 | 실제 scan 문서 | 3~8p | skew, blur, 낮은 contrast |
| D6 | 이미지 중심 보고서 | 8~15p | 사진, caption, callout |
| D7 | chart 포함 보고서 | 10~20p | chart axis, legend, 숫자 |
| D8 | 복잡한 신청서 | 3~6p | merged cell, checkbox, form |
| D9 | 50~100페이지 지침서 | 50~100p | long-range dependency |
| D10 | 본문 + 첨부문서 세트 | 3~5 files | 본문, 양식, FAQ, 별첨 간 연결 |
| D11 | 정정공고/변경공고 세트 | 선택 | 이전 공고와 최신 공고 충돌 |
| D12 | clean/scan paired document | 선택 | 동일 GT에서 degradation robustness |

특히 **D11 "정정공고"가 매우 중요합니다.**

예를 들어:

```text
본문: 접수 마감 8월 31일
정정공고: 접수 마감 9월 3일로 변경
첨부 양식: 과거 날짜가 그대로 남아 있음
```

이 상황에서는 OCR 점수가 99.9%여도 **9월 3일 대신 8월 31일을 내놓으면 Unfold 관점에서 실패**입니다.

또한 scan robustness를 측정할 때는 가능하면 실제 scan과 함께 **같은 clean source를 200~300 dpi raster image로 변환한 paired sample**을 하나 넣는 것이 좋습니다. 동일한 Ground Truth를 사용하므로 "문서 내용 차이"가 아니라 scan degradation에 대한 변화량을 직접 볼 수 있습니다.

### 표본 수는 몇 개가 의미 있는가

문서 3개는 제품 우열을 말하기에는 지나치게 작습니다. 하지만 30분짜리 smoke test에는 충분합니다.

| 수준 | 문서 | 평가 unit | 말할 수 있는 범위 |
|---|---:|---:|---|
| Quick | **3개** | 15~25 critical fields | "명백한 failure mode가 있는가?" |
| 2시간 | **6개** | 35~50 fields, 3 tables, 8~12 applicant cases | "이 소규모 문서군에서 어떤 경향이 있는가?" |
| 발표용 | **10~12개** | 60~100 fields, 5~8 tables, 15~20 cases | "Unfold가 고른 대표 업무 표본에서 어떤 trade-off가 관찰됐는가?" |
| 제품 선정용 | major stratum마다 수십 개 이상 | 수백 documents 권장 | 보다 일반화 가능한 운영 의사결정 |

마지막 행의 수치는 통계적 법칙이 아니라 **실무적인 확장 권고**입니다. 특히 한 PDF에서 field 50개를 평가했다고 해서 통계적 독립 표본 `n=50`으로 취급하면 안 됩니다. 모두 같은 문서에서 나온 correlated observation입니다.

발표용 10~12개는 **방향성 있는 case-study benchmark**로는 충분하지만, "한국 행정문서 전체에서 A가 B보다 우수하다"라고 일반화하기에는 부족합니다.

## Ground Truth와 평가 지표

**C. Ground Truth 방법**

### 전체 PDF를 사람이 전사하지 마세요

3명이 해커톤에서 full-document annotation을 하면 GT를 만드는 데 시간을 다 씁니다.

대신 **Challenge-zone Ground Truth**를 만듭니다.

각 문서에서 다음만 정확하게 annotation합니다.

```json
{
  "doc_id": "scholarship_01",
  "blocks": [
    {
      "id": "b12",
      "page": 2,
      "type": "heading",
      "level": 2,
      "text": "...",
      "bbox": [x1, y1, x2, y2],
      "order": 12,
      "parent": "b4"
    }
  ],
  "tables": [
    {
      "page_start": 3,
      "page_end": 4,
      "cells": [
        {
          "row": 0,
          "col": 0,
          "row_span": 2,
          "col_span": 1,
          "text": "..."
        }
      ]
    }
  ],
  "fields": {
    "application_deadline": {
      "value": "2026-09-03T17:00:00+09:00",
      "critical": true,
      "evidence": [
        {"page": 2, "bbox": [0, 0, 0, 0]}
      ]
    }
  },
  "eligibility_conditions": [],
  "required_documents": [],
  "applicant_cases": []
}
```

### Ground Truth 생성 원칙

**텍스트**는 두 버전을 가집니다.

`strict_text`는 punctuation, spacing까지 포함한 원문이고, `normalized_text`는 Unicode NFC와 controlled whitespace normalization만 합니다. **숫자, 단위, %, 금액, 부등호, 마이너스 기호는 절대 느슨하게 normalization하지 않습니다.**

행정 문서에서:

```text
3.5 이상
3.5 초과

100만원
1,000만원

8월 31일
9월 31일
```

은 "semantic similarity가 높다"는 이유로 같은 답으로 처리하면 안 됩니다.

**표**는 model/OCR 결과를 다시 GT로 복사하지 않고 사람이 원본을 보고 `row`, `column`, `rowSpan`, `columnSpan`, `cell text`를 만듭니다. PubTables 계열이 table detection과 structure recognition을 명시적으로 구분하고, 최신 PubTables-v2는 multi-page table extraction까지 별도 benchmark 대상으로 다룹니다. citeturn18search18turn18search2turn18search22

**행정 조건**은 자연어 문장 하나가 아니라 atomic proposition으로 쪼갭니다.

```json
{
  "subject": "신청자",
  "attribute": "직전학기_평점",
  "operator": ">=",
  "value": 3.5,
  "unit": "4.5",
  "scope": "재학생",
  "negated": false,
  "exception": null,
  "evidence_page": 2
}
```

Key Information Extraction을 individual entity accuracy만으로 평가하면 field 간 grouping 관계를 놓칠 수 있습니다. KIEval 역시 산업용 KIE 평가에서 individual entity뿐 아니라 grouped structure까지 평가해야 한다고 제안합니다. citeturn19search0turn19search3

### Deadline GT는 특별 취급합니다

아래를 별개의 field로 annotation하세요.

```text
접수 시작일
접수 마감일
온라인 제출 마감시각
학교 추천 마감일
우편 도착 기준일
서류 보완 마감일
```

모델이 아무 날짜 하나를 잘 추출했다고 "날짜 추출 성공"으로 보지 않습니다.

### Eligibility GT는 문서가 아니라 Applicant Case로 평가합니다

문서별로 2~4개의 synthetic applicant profile을 만듭니다.

예:

```json
{
  "case_id": "case_03",
  "gpa": 3.49,
  "income_bracket": 7,
  "year": 3,
  "previous_scholarship": false,
  "expected": "ineligible",
  "reason": ["gpa_threshold"]
}
```

경계조건을 넣어야 합니다.

```text
GPA 3.49 vs 3.50
소득 6구간 vs 7구간
마감시간 16:59 vs 17:01
재학생 vs 휴학생
필수서류 있음 vs 한 장 누락
```

그리고 반드시 세 번째 label을 허용하세요.

```text
eligible
ineligible
insufficient_information
```

`insufficient_information`이 없으면 모델은 정보가 없어도 억지로 yes/no를 선택하게 되고 hallucination benchmark가 오염됩니다.

### 3명이 Ground Truth를 만드는 역할

| 사람 | 주 역할 | Secondary check |
|---|---|---|
| **A** | text, reading order, heading, table, coordinates | B가 중요 table 검증 |
| **B** | 조건, 날짜, 필요 서류, eligibility case | C가 critical field 검증 |
| **C** | API 실행, latency/cost logging, result normalization | A/B disagreement adjudication |

단, **deadline, eligibility threshold, required document 같은 Critical GT는 최소 두 명이 원문을 직접 확인**해야 합니다.

모델 결과를 본 뒤 GT를 수정하면 benchmark leakage가 생깁니다. 순서는 반드시:

```text
문서 선정
→ GT 확정
→ prompt/schema 확정
→ scoring rule 확정
→ 모델 실행
```

입니다.

### Ambiguous GT도 명시합니다

실제 행정 공고 자체가 애매할 수 있습니다.

```text
status = verified
status = ambiguous
status = excluded
```

세 단계로 두고 `ambiguous`와 `excluded` 항목은 strict accuracy denominator에서 빼되 **몇 개를 제외했는지는 발표에서 공개**하세요.

---

**D. Metric 정의**

공개 document benchmark들도 단일 숫자 대신 여러 component를 분리하는 방향입니다. OmniDocBench는 text, table, formula, reading order 등을 나누며 reading order에는 Normalized Edit Distance를 사용합니다. DocLayNet은 80,863개 수작업 annotation 페이지와 11개 bounding-box class를 제공하고, OCRBench v2는 text localization, OCR, layout perception, reasoning 등을 폭넓게 다룹니다. citeturn18search8turn18search1turn18search19

Unfold에서는 아래 20개를 그대로 쓰되 **행정 safety에 가중치**를 주는 것을 권합니다.

| # | Metric | 정의 | Weight |
|---|---|---|---:|
| 1 | Text extraction accuracy | CER + 숫자 exact accuracy | 6 |
| 2 | Reading order | Pairwise order accuracy | 4 |
| 3 | Heading hierarchy | heading level F1 + parent relation | 3 |
| 4 | Table reconstruction | cell content + row/column structure | 5 |
| 5 | Merged cells | rowSpan/colSpan exact F1 | 3 |
| 6 | Image/diagram identification | detection + type F1 | 2 |
| 7 | Checkbox | state + associated label exact | 3 |
| 8 | Layout structure | block class macro F1 | 3 |
| 9 | Source coordinates | bbox coverage × IoU | 3 |
| 10 | Page grounding | evidence page exact accuracy | 3 |
| 11 | 조건 추출 | atomic condition micro F1 | **9** |
| 12 | 날짜/기한 | normalized deadline exact match | **9** |
| 13 | 필요 서류 | mandatory/conditional document set F1 | **7** |
| 14 | 자격조건 판단 | 3-class applicant-case accuracy | **11** |
| 15 | Hallucination | Unsupported Claim Rate | **9** |
| 16 | Repeatability | 3-run field agreement | 4 |
| 17 | Latency | end-to-end median latency | 3 |
| 18 | Cost | actual cost per completed job | 3 |
| 19 | Long-document consistency | cross-page fact/dependency accuracy | 5 |
| 20 | Accessibility reconstruction | structural ingredient coverage/correctness | 5 |
| | **합계** | | **100** |

구조/parse가 35점, 행정 semantic safety가 45점, 운영/long-doc/accessibility가 20점입니다.

다만 **총점 1위가 발표의 첫 번째 숫자가 되어서는 안 됩니다.**

### Text extraction

기본:

\[
CER = \frac{Levenshtein(pred, gt)}{|gt|}
\]

\[
TextScore = 100 \times \max(0, 1-CER)
\]

그리고 별도로:

```text
Digit Exact Accuracy
Date String Exact Accuracy
Amount Exact Accuracy
```

를 diagnostic으로 보여주세요.

행정문서에서는 쉼표 하나 틀리는 것과 지원금 100만원을 1,000만원으로 읽는 것은 같은 오류가 아닙니다.

### Reading order

해커톤에서는 복잡한 sequence edit metric보다 사람이 이해하기 쉬운 **Pairwise Order Accuracy**를 추천합니다.

예를 들어 GT block 순서가:

```text
A → B → C → D
```

라면 비교 가능한 pair:

```text
A<B
A<C
A<D
B<C
B<D
C<D
```

6개 중 모델이 몇 개를 올바르게 보존하는지 계산합니다.

공식 benchmark와 장기적으로 맞추고 싶다면 OmniDocBench식 Normalized Edit Distance도 추가할 수 있습니다. citeturn18search8

### Heading hierarchy

```text
Heading level macro F1 × 0.5
+
Parent-child relation accuracy × 0.5
```

Markdown으로:

```markdown
# 지원사업
## 지원대상
### 소득요건
```

을 뽑았는지만 보는 것이 아니라 `소득요건`이 `지원대상` 아래에 있는지도 평가합니다.

### Table reconstruction

발표용 simple score:

```text
TableScore =
0.6 × Cell Content F1
+
0.4 × Structural Exact Accuracy
```

더 제대로 자동화할 경우 PubTables 계열의 GriTS 또는 OmniDocBench 계열 table structure metric을 도입하면 됩니다. PubTables-1M은 table detection, structure recognition, functional analysis를 위해 만들어졌으며, PubTables-v2는 multi-page table까지 확장합니다. citeturn18search18turn18search22

### Merged cells

예측 cell을:

```text
(row_start, row_end, col_start, col_end, text)
```

tuple로 canonicalize합니다.

모두 맞아야 해당 cell을 exact correct로 인정합니다.

이 항목은 cloud parser를 넣으면 의미가 더 커집니다. Azure Document Intelligence는 table cell에 `rowIndex`, `columnIndex`, `rowSpan`, `columnSpan`, bounding region을 명시적으로 제공합니다. AWS Textract도 merged cell과 selection element를 구조적으로 반환합니다. citeturn17search8turn17search2

### Image/diagram identification

GT object별로:

```text
figure
chart
diagram
logo
photo
```

를 annotation하고,

```text
IoU >= 0.5
+
class correct
```

일 때 true positive로 인정합니다.

### Checkbox

단순히 `☑`를 찾았는지만 보면 부족합니다.

둘 다 맞아야 correct입니다.

```text
checkbox_state = checked / unchecked
associated_label = "개인정보 제공 동의"
```

Google Document AI Form Parser는 checkbox를 KVP 또는 visual element로 표현할 수 있고, AWS Textract는 selection element와 `SELECTED/NOT_SELECTED` 상태를 제공합니다. citeturn17search5turn17search6

### Layout structure

Canonical class를 6~8개로 줄이세요.

```text
heading
paragraph
list
table
figure
caption
form
footer/header
```

`IoU >= 0.5`인 detection의 macro F1로 봅니다.

DocLayNet은 11개의 bounding-box class를 사람이 annotation한 대표적인 layout benchmark이므로 장기 benchmark를 만들 때 class 설계 참고자료로 적합합니다. citeturn18search1

### Source coordinates

서로 다른 API의 coordinate system을 모두:

```text
[x1, y1, x2, y2]
0 ~ 1000
```

으로 normalize합니다.

평가는:

```text
Localization Coverage
×
Mean IoU
```

입니다.

`Localization Coverage`가 중요한 이유는 "맞춘 2개만 좌표를 내고 나머지는 좌표를 안 낸 모델"이 높은 평균 IoU를 얻는 것을 막기 위해서입니다.

Google Document AI는 page number와 bounding polygon을 구조적으로 제공하고, Azure도 text/table element의 bounding region을 제공합니다. citeturn17search23turn17search19

범용 LLM이 prompt로 bbox를 반환하는 것도 허용하되 **동일한 IoU 기준으로 채점**하세요. OpenAI도 vision 문서에서 spatial localization, non-Latin text, 작은 글자, rotation 등에 제한이 있을 수 있음을 명시하므로 이 부분은 실제 한국어 문서에서 검증할 가치가 있습니다. citeturn16search2

### Page grounding

각 extracted field마다:

```json
{
  "value": "...",
  "source_page": 7,
  "source_bbox": [...]
}
```

를 의무화합니다.

Score:

```text
올바른 field 중
source_page까지 정확한 field 비율
```

입니다.

페이지를 맞히지 못하면 **정보 값 자체가 우연히 맞아도 grounded answer로 인정하지 않는 strict score**도 병행하세요.

### 조건 추출

조건을 atomic proposition으로 나누고 micro precision/recall/F1을 계산합니다.

특히:

```text
operator
negation
exception
scope
unit
```

이 다르면 다른 조건입니다.

예를 들어:

```text
"재학생 중 3.5 이상"
"재학생 또는 휴학생 중 3.5 이상"
```

은 거의 같은 문장이지만 eligibility 시스템에서는 전혀 다릅니다.

### 날짜/기한 추출

Canonical form:

```text
event_type
start_at
end_at
timezone
submission_method
exception
```

핵심 마감일은 fuzzy match가 아니라 **exact match**로 평가합니다.

### 필요 서류

GT:

```json
{
  "name": "성적증명서",
  "requirement": "mandatory",
  "condition": null,
  "original_copy": "original",
  "count": 1
}
```

최소한:

```text
mandatory
conditional
optional
```

을 구분해야 합니다.

일반 Set F1과 별도로 **Mandatory Document Recall**을 반드시 보여주세요.

필수 서류 하나 누락은 optional 문서 하나 잘못 추출한 것보다 훨씬 중요합니다.

### 자격조건 판단

Applicant Case에서:

```text
eligible
ineligible
insufficient_information
```

3-class exact accuracy를 사용합니다.

그리고 별도로 반드시 표시해야 할 것이:

**False Positive Eligibility**

입니다.

실제로 자격이 없는 사람을 "지원 가능"이라고 판단하는 오류는 Unfold에서 특히 위험합니다.

### Hallucination

출력을 atomic claim으로 쪼갭니다.

\[
UCR =
\frac{unsupported\ claims}{all\ claims}
\]

\[
HallucinationScore = 100 \times (1-UCR)
\]

단, 아래는 평균에 묻지 않고 **Critical Hallucination Count**로 따로 표시합니다.

```text
존재하지 않는 마감일 생성
존재하지 않는 지원 조건 생성
존재하지 않는 필수 서류 생성
존재하지 않는 제외 조건 생성
```

### Repeatability

동일 문서, 동일 prompt, 동일 model ID, 동일 API parameter로 **3회 실행**합니다.

```text
Field Agreement Rate =
3회 모두 같은 normalized value인 field /
전체 field
```

Eligibility decision도 별도로 3-run agreement를 봅니다.

일부 최신 reasoning model은 temperature 같은 전통적인 sampling parameter가 동일하게 적용되지 않을 수 있으므로 "temperature=0" 자체를 모든 provider에 강요하기보다는 **각 provider에서 가능한 가장 재현성 높은 production setting을 사용하고 모든 parameter를 기록**해야 합니다. Claude Opus 5의 경우 thinking이 기본 활성화되고 effort 설정이 모델 동작과 token/latency에 영향을 줄 수 있습니다. citeturn15search6

### Latency

두 개를 기록하면 좋습니다.

```text
Cold E2E latency
= upload/preprocess + API processing + result

Warm/repeated latency
= file reuse가 가능한 경우 subsequent request
```

요청 수가 적은 해커톤에서는 `P95`라고 과장하지 말고:

```text
median
max
```

를 표시하세요.

20회 이상 반복할 때부터 P50/P95 표기가 그나마 의미가 있습니다.

### Cost

무료 credit은 제외합니다.

```text
Total Job Cost =
conversion
+ parser
+ extraction
+ LLM input
+ LLM reasoning/output
+ retry
```

를 계산합니다.

그리고:

```text
$/100 pages
$/document
$/correct critical field
```

세 값을 만드세요.

현재 가격 구조 자체가 서로 다릅니다. Upstage Parse와 Extract는 page 기반으로 가격을 책정하는 반면, GPT 계열은 token 기반입니다. OpenAI GPT-5.6 역시 context 길이에 따라 token 단가 구조가 달라질 수 있습니다. AWS Textract는 AnalyzeDocument feature 조합에 따라 page당 가격이 달라지며, 예를 들어 미국 Oregon에서 Tables + Forms + Queries 조합은 공식 pricing 예시상 첫 100만 페이지 구간에서 페이지당 $0.070입니다. 따라서 단순한 "API call 하나 가격" 비교보다 **Unfold job 하나를 완료하는 총비용**을 비교해야 합니다. citeturn16search3turn17search3

### Long-document consistency

긴 문서에는 10~15개의 cross-page assertion을 미리 만듭니다.

예:

```text
p.4 지원 대상 정의
↕
p.52 예외 규칙
```

또는:

```text
본문 조건
↕
별첨 조건
↕
정정 공고
```

Score:

```text
Cross-page exact accuracy
+
Contradiction-free rate
```

입니다.

긴 context를 지원한다는 사실과 긴 문서에서 모든 dependency를 정확히 해결한다는 것은 다른 주장입니다. GPT-5.6 Sol은 1.05M context, Claude Opus 5는 1M context를 제공하고 Gemini는 PDF 최대 1,000페이지 ingestion을 지원하지만, 이 benchmark에서는 **실제 조건 일관성을 별도로 검증**해야 합니다. citeturn16search4turn15search6turn15search0

### Accessibility reconstruction

이것을 **"WCAG 준수 점수"라고 부르면 안 됩니다.**

측정하는 것은 **Accessibility Reconstruction Readiness**입니다.

8개 ingredient를 봅니다.

| Ingredient | 필요한 output |
|---|---|
| Text | machine-readable Unicode text |
| Reading order | logical sequence |
| Heading | H1/H2/H3 equivalent structure |
| List | list grouping/order |
| Table | row, column, headers, spans |
| Figure | type, location, caption/description |
| Form | checkbox state + associated label |
| Source mapping | page + coordinate |

W3C PDF accessibility techniques에서도 logical reading order, OCR text, table structure, heading structure, image alternative, form labels 등을 각각 중요한 구조로 다룹니다. 특히 복잡한 layout은 올바른 reading order를 훼손할 수 있고, assistive technology가 table을 이해하려면 row/header/data-cell 관계가 구조화되어 있어야 합니다. citeturn19search6turn19search2turn19search4turn19search20

따라서 이 점수는:

```text
"이 결과로 접근 가능한 HTML/PDF를 재구축하는 데
필요한 정보를 얼마나 제공하는가?"
```

에 대한 점수이지, 실제 PDF/UA 또는 WCAG conformity certificate가 아닙니다.

## 실행용 Scoring Sheet

**E. Scoring Sheet**

가장 중요한 설계 원칙은 **총점 위에 Critical Safety Panel을 둔다**는 것입니다.

### 발표 화면 최상단

| Critical Safety Metric | Upstage | GPT | Gemini | Claude | Azure/GCP/AWS |
|---|---:|---:|---:|---:|---:|
| Wrong deadline | x / n | | | | |
| Missed mandatory document | x / n | | | | |
| Invented mandatory document | x / n | | | | |
| False-positive eligibility | x / n | | | | |
| Wrong evidence page | x / n | | | | |
| Unsupported critical claim | x / n | | | | |

이 표는 절대 weighted average 안에 숨기지 마세요.

예를 들어:

```text
Model A: Overall 91점, 잘못된 마감일 2건
Model B: Overall 86점, 잘못된 마감일 0건
```

이라면 **Unfold의 선택이 꼭 Model A일 이유가 없습니다.**

### 전체 Sheet

| Metric | Weight | GT units | Raw | Score 0~100 | Critical errors | Notes |
|---|---:|---:|---|---:|---:|---|
| Text | 6 | | CER | | | |
| Reading order | 4 | | | | | |
| Heading | 3 | | | | | |
| Table | 5 | | | | | |
| Merged cells | 3 | | | | | |
| Image/diagram | 2 | | | | | |
| Checkbox | 3 | | | | | |
| Layout | 3 | | | | | |
| Coordinates | 3 | | | | | |
| Page grounding | 3 | | | | | |
| Conditions | 9 | | | | | |
| Deadline | 9 | | | | | |
| Required docs | 7 | | | | | |
| Eligibility | 11 | | | | | |
| Hallucination | 9 | | | | | |
| Repeatability | 4 | | | | | |
| Latency | 3 | | seconds | | | |
| Cost | 3 | | USD/job | | | |
| Long consistency | 5 | | | | | |
| Accessibility readiness | 5 | | | | | |

총점:

```text
WeightedScore =
Σ(MetricScore × Weight) / 100
```

Latency와 cost는 서로 단위가 다르므로 hackathon용으로 상대점수를 쓸 수 있습니다.

```text
Latency Score =
100 × fastest_median / vendor_median

Cost Score =
100 × lowest_cost_per_completed_job / vendor_cost
```

단, 총점 순위에는 큰 의미를 부여하지 말고 **각 영역 profile**을 같이 보여야 합니다.

### 가장 유용한 네 개의 headline KPI

20개 전체를 발표에서 다 보여주면 청중은 기억하지 못합니다.

Unfold용 headline은 네 개면 충분합니다.

**Critical Field Exact Accuracy**

```text
deadline
eligibility threshold
exclusion
mandatory document
submission channel
```

의 exact accuracy입니다.

**Admin Decision Accuracy**

Applicant Case 3-class exact accuracy입니다.

**Evidence Grounding Rate**

정답을 맞힌 결과 중 올바른 page/evidence까지 댄 비율입니다.

**Critical Hallucination Count**

지원자의 행동을 바꿀 수 있는 unsupported fact의 건수입니다.

그리고 두 번째 slide에서:

```text
Structure Fidelity
Latency
Cost
Accessibility Readiness
```

를 보여주면 됩니다.

### 공통 semantic output schema

모든 범용 multimodal model에는 동일한 의미의 schema를 주세요.

```json
{
  "application_period": {
    "start_at": null,
    "deadline_at": null,
    "status": "explicit|not_found",
    "sources": [
      {
        "page": 0,
        "bbox": null
      }
    ]
  },
  "eligibility_conditions": [
    {
      "subject": "",
      "attribute": "",
      "operator": "",
      "value": null,
      "unit": null,
      "exception": null,
      "source_page": 0
    }
  ],
  "required_documents": [
    {
      "name": "",
      "requirement": "mandatory|conditional|optional",
      "condition": null,
      "source_page": 0
    }
  ],
  "eligibility_decision": {
    "label": "eligible|ineligible|insufficient_information",
    "reasons": [],
    "source_pages": []
  }
}
```

공통 instruction 핵심은 이것입니다.

```text
문서에 명시되지 않은 정보는 추론하지 않는다.
근거가 부족하면 not_found 또는 insufficient_information을 반환한다.
모든 critical field는 source page를 반환한다.
여러 문서가 충돌하면 최신 수정/정정 규정을 식별하되,
어떤 문서가 우선하는지 근거를 제시한다.
```

web search, external retrieval, browsing tool은 전부 끕니다.

평가 대상은 **주어진 문서만으로 얼마나 정확한가**이기 때문입니다.

## 시간별 실험 프로토콜

**F. 30분 실험**

30분 Benchmark는 **benchmark라기보다 강한 smoke test**입니다.

특히 Ground Truth를 30분 안에 처음부터 만들면 평가 신뢰도가 너무 낮아집니다. 가장 좋은 방법은 hackathon 시작 전에 3개 문서의 challenge-zone GT를 준비해 두는 것입니다.

### Dataset

```text
3 documents
약 8~12 evaluated pages
15~25 critical fields
1 complex table
1 scan
HWP/HWPX 또는 attachment case 1개
```

Provider:

```text
Upstage
GPT-5.6 Sol
Gemini 3.7 Flash
Claude Opus 5
```

Cloud Document AI는 생략합니다.

### 30분에서 볼 Metric

20개 전부를 얕게 보지 말고:

```text
Text
Table
Source/Page grounding
Deadline
Required documents
Eligibility
Hallucination
Latency
Cost
```

에 집중합니다.

### Timeline

| 시간 | Member A | Member B | Member C |
|---|---|---|---|
| 0~5분 | GT quick check | prompt/schema freeze | model/API config freeze |
| 5~12분 | Upstage/GPT 결과 check | Gemini/Claude 결과 check | 전체 API 실행 및 timing |
| 12~20분 | table/structure scoring | conditions/deadline scoring | output canonicalization |
| 20~25분 | critical errors verify | eligibility cases verify | cost calculation |
| 25~28분 | disagreement review | disagreement review | score aggregation |
| 28~30분 | 결과 검증 | slide 문구 검증 | chart/table 생성 |

### 30분 결과물

딱 두 표만 만들면 됩니다.

```text
Critical Safety Panel
+
9-metric score table
```

30분 테스트에서 발표 가능한 문구:

> **"세 개의 사전 선정 문서와 20개의 critical field를 대상으로 한 smoke test에서, Upstage는 X 영역에서 상대적으로 강했고 Y 영역에서는 GPT/Gemini/Claude와 차이가 작거나 열세였습니다. 이 결과는 제품 전체의 일반적 우열을 의미하지 않습니다."**

---

**G. 2시간 실험**

여기부터 **"작지만 실제 benchmark"**라고 부를 만합니다.

### Dataset

```text
6 documents
35~60 evaluated pages/challenge zones
35~50 critical fields
3 complex tables
1 multi-page table
1 scan
1 HWP/HWPX
1 long/attachment task
8~12 applicant cases
```

Provider:

```text
Upstage
GPT
Gemini
Claude
+
Azure, Google Cloud, AWS 중 1개
```

팀이 이미 cloud account/API를 갖고 있다면 Azure 또는 AWS를 추가하는 것을 추천합니다. Azure는 table cells에 row/column span과 bounding region을 명시적으로 제공하고, AWS Textract도 merged cells, checkbox selection status, geometry를 제공하므로 Upstage의 document-specific 구조화 능력이 정말 차별점인지 검증하기 좋은 대조군입니다. citeturn17search8turn17search2

### Timeline

| 시간 | 작업 |
|---|---|
| 0~20분 | 6개 문서 challenge zones와 Critical GT 확정 |
| 20~30분 | common prompt, schema, scoring freeze |
| 30~50분 | 전체 provider parallel run |
| 50~75분 | structure, table, coordinates 평가 |
| 75~95분 | conditions, deadline, documents, eligibility 평가 |
| 95~105분 | 2~3개 문서 repeatability 3회 실행 |
| 105~112분 | latency/cost, long-doc, accessibility 평가 |
| 112~118분 | critical disagreement adjudication |
| 118~120분 | headline 결과 freeze |

### 2시간에서 3명이 효율적으로 일하는 법

Member A는 **visual/structural track**만 책임집니다.

```text
1~10
text
order
heading
table
merged cells
images
checkbox
layout
bbox
page
```

Member B는 **admin semantic track**만 봅니다.

```text
11~15
conditions
deadline
required docs
eligibility
hallucination
```

Member C는:

```text
API
canonical adapter
repeatability
latency
cost
long doc
aggregation
```

을 맡습니다.

다만 A 또는 B의 **critical error 판정은 다른 사람 한 명이 반드시 재검증**합니다.

---

**H. 해커톤 발표에 넣을 수 있는 Benchmark**

추천 최종 benchmark scale은:

```text
10~12 source documents
80~150 evaluated pages/zones
60~100 critical fields
5~8 complex tables
2+ multi-page/merged tables
15~20 applicant cases
1 x 50~100 page document
1 x multi-attachment set
3 repeat runs on ≥3 representative documents
```

입니다.

모델을 모두 돌릴 수 있다면:

```text
Upstage
GPT-5.6 Sol
Gemini 3.7 Flash
Claude Opus 5
Azure Document Intelligence
Google Document AI
AWS Textract
```

까지 확장합니다.

단, Azure/Google/AWS에는 자체 general reasoning 능력이 없거나 비교 surface가 다르므로 **semantic eligibility 점수를 parser 단독 점수로 만들지 않습니다.**

예:

```text
Azure Layout → Common Reasoner
Google DocAI → Common Reasoner
Textract → Common Reasoner
Upstage Parse → Common Reasoner
```

라는 **Controlled Track**을 따로 만들면 됩니다.

그리고:

```text
Upstage Parse + Extract
GPT direct
Gemini direct
Claude direct
```

는 **Native End-to-End Track**으로 봅니다.

이 두 결과를 섞으면 안 됩니다.

### 발표 구성 추천

**Slide 1: 질문**

> **"범용 multimodal LLM이 PDF를 직접 이해하는 2026년에, 왜 별도의 Document AI가 필요한가?"**

**Slide 2: 공정성**

```text
동일 documents
동일 Ground Truth
동일 critical fields
provider-specific native best practice
GT는 모델 실행 전에 freeze
```

**Slide 3: Critical Safety Panel**

막대그래프보다 raw count가 좋습니다.

```text
Wrong Deadline
Missed Mandatory Docs
False-positive Eligibility
Critical Hallucination
Wrong Evidence Page
```

**Slide 4: Accuracy Profile**

Radar chart를 쓰고 싶더라도 20축은 피하세요.

다섯 영역으로 aggregate합니다.

```text
Text/Layout
Tables/Forms
Grounding
Admin Reasoning
Operations
```

**Slide 5: Document Type별 winner**

예:

| 문서 | Upstage | GPT | Gemini | Claude |
|---|---|---|---|---|
| Clean scholarship PDF | | | | |
| Scan | | | | |
| HWP | | | | |
| Multi-page table | | | | |
| Chart-heavy | | | | |
| 80-page guideline | | | | |
| Attachment set | | | | |

이 표가 총점보다 오히려 제품 결론에 도움이 됩니다.

**Slide 6: Cost vs Critical Accuracy**

x축:

```text
Cost / document
```

y축:

```text
Critical Field Exact Accuracy
```

bubble size:

```text
median latency
```

로 만들면 "왜 Upstage인가?"를 비용까지 포함해 한 장에서 보여줄 수 있습니다.

### Upstage marketing benchmark를 그대로 쓰지 않아야 하는 이유

Upstage는 자체 Document Parse benchmark와 KIE benchmark 결과를 공개하고 있으며 Enhanced mode에 multi-page tables, charts, images, checkboxes 등의 개선을 설명합니다. 그러나 일부 chart/image 평가에서는 downstream GPT-4.1 question-answering을 사용한 항목도 있습니다. 따라서 이를 GPT, Gemini, Claude와의 독립적인 head-to-head 결과로 그대로 해석하기보다는 **벤더 내부 자료는 hypothesis 생성에만 쓰고 최종 결론은 동일한 Unfold dataset과 GT에서 재측정하는 것이 공정합니다.** citeturn1view3turn2search1

## 결과 해석과 공정성

**I. 예상 Interpretation**

실험 전부터 "Upstage가 더 좋을 것"이라고 쓰는 대신 아래와 같은 **conditional interpretation**을 준비해두면 좋습니다.

### 결과가 이런 경우

| 관찰 | 해석 |
|---|---|
| Upstage가 table, reading order, bbox에서 높고 semantic은 비슷 | **"Upstage의 가치는 reasoning model 자체보다 reliable document representation에 있다."** |
| GPT/Gemini/Claude가 parse와 semantic 모두 비슷하거나 높음 | **"현재 Unfold workload에서는 별도 Document AI 도입 근거가 약하다."** |
| Upstage parse는 강하지만 eligibility가 약함 | **"Upstage + general LLM hybrid가 후보."** |
| 범용 LLM은 clean PDF에서 강하지만 scan/HWP/table에서 급락 | **"문서 난도가 높아질수록 specialized pipeline의 가치가 커진다."** |
| Azure/AWS가 구조 점수에서 Upstage보다 높음 | **"Upstage의 강점은 pure parsing 자체가 아니라 Korean/HWP/workflow/cost까지 포함해 재검토해야 한다."** |
| Gemini/Claude가 long-document에서 더 강함 | **"긴 규정집 reasoning에는 general LLM 우위가 있고 parser를 별도로 결합할 가치가 있다."** |
| 모든 모델 accuracy가 비슷함 | accuracy 대신 **cost, latency, source traceability, implementation complexity**로 선택 |
| 가장 높은 평균점수 모델에 critical error가 있음 | 평균보다 **safety gate** 우선 |

### 기능상 예상해볼 수 있는 영역

Upstage의 공식 문서에 HWP/HWPX conversion과 multi-page table stitching이 명시되어 있으므로 **한국 행정문서의 file handling과 table normalization은 반드시 실험할 가치가 있는 차별화 hypothesis**입니다. citeturn15search1

Azure와 AWS도 table span, selection marks, geometry 같은 구조를 native API output으로 제공하므로 **좌표와 forms/table에서 Upstage만 전문 기능을 가진다고 가정해서는 안 됩니다.** citeturn17search8turn17search6

GPT, Gemini, Claude 역시 현재 PDF를 visual document로 직접 처리할 수 있으므로 clean PDF의 단순 text/semantic extraction에서는 전문 parser가 반드시 우월할 이유가 없습니다. 실제 차이는 benchmark로 확인해야 합니다. citeturn16search1turn15search0turn15search3

반면 source-coordinate reconstruction은 제품 설계 차이가 드러날 가능성이 높은 영역입니다. Google Document AI와 Azure 등은 bounding geometry를 first-class output으로 제공하는 반면, 범용 multimodal LLM에서는 visual localization 결과를 생성하도록 요청해야 하는 경우가 많습니다. OpenAI도 vision의 spatial localization과 한국어 같은 non-Latin text에 제한 가능성을 공식적으로 안내하고 있습니다. 따라서 **"답이 맞는가?"와 "답이 어디서 나왔는가?"를 분리 평가하는 것이 특히 중요합니다.** citeturn17search23turn17search19turn16search2

### Unfold에서 진짜 중요한 decision rule

최종 선택 로직을 이렇게 두는 것을 추천합니다.

```text
Step 1.
Critical error가 허용 가능한가?

No → 탈락 또는 human-review 필요
Yes ↓

Step 2.
Critical field와 eligibility accuracy가 충분한가?

No → 탈락
Yes ↓

Step 3.
Evidence/page/coordinate traceability가 충분한가?

No → accessibility와 운영 workflow 검토
Yes ↓

Step 4.
Cost × latency × implementation complexity 비교
```

즉 **정확도 1등을 뽑는 benchmark가 아니라 production admission test**에 가깝게 만듭니다.

### 발표에서 쓸 수 있는 올바른 표현

좋은 표현:

> **"이번 테스트에서 사용한 10개 행정/지원 문서와 사전 정의한 78개 critical field 범위에서는 Upstage가 복잡한 표와 source grounding에서 가장 높은 점수를 기록했습니다."**

> **"이번 표본에서는 GPT가 clean digital PDF에서는 Upstage와 유사한 정확도를 보였지만, scan과 multi-page table subset에서는 차이가 관찰됐습니다."**

> **"이 결과는 한국 행정문서 전체에 대한 일반적인 우열을 의미하지 않으며, Unfold가 선정한 문서 유형과 현재 API/model configuration에 대한 결과입니다."**

> **"모델 간 평균 정확도 차이보다 잘못된 마감일과 자격 판정 오류의 분포를 더 중요하게 해석했습니다."**

> **"Upstage가 모든 항목에서 우월한 것은 아니었지만, 이 표본에서는 문서 구조 보존과 source traceability가 Unfold workflow에 유의미한 장점으로 관찰됐습니다."**

반대로 피해야 할 표현:

```text
"Upstage가 GPT보다 문서 이해를 잘한다."

"Upstage가 Document AI 최고다."

"GPT는 hallucination이 심하다."

"정확도 97%이므로 모든 장학금 공고에 안전하다."

"10개 문서에서 이겼으므로 통계적으로 우월하다."
```

10개 문서에서 field를 100개 뽑았다고 `n=100` independent sample이라고 주장해서도 안 됩니다.

confidence interval을 넣고 싶다면 **field 단위가 아니라 document 단위 cluster bootstrap**을 하는 것이 더 정직합니다. 표본이 아주 작을 때는 p-value보다 `17/20`, `9/10` 같은 raw count와 per-document score를 보여주는 편이 낫습니다.

---

**J. 공정성을 위한 주의사항**

### GT를 모델보다 먼저 봐야 합니다

가장 심각한 benchmark contamination은:

```text
모델 결과 확인
→ "아, 이것도 맞는 것 같네"
→ GT 수정
```

입니다.

GT와 scoring rubric을 먼저 freeze하세요.

### Model ID와 날짜를 기록합니다

`latest` alias는 시간이 지나면 다른 모델로 바뀔 수 있습니다.

발표 Appendix에:

```text
Run date: 2026-08-22
Provider
Model ID
API version
reasoning/effort
PDF detail/resolution
temperature/sampling settings
prompt version
```

을 남기세요.

예를 들어 현재 OpenAI `gpt-5.6` alias는 GPT-5.6 Sol로 routing되지만 재현성 관점에서는 가능한 경우 canonical ID를 기록하는 편이 낫습니다. citeturn16search4

### 범용 LLM끼리는 semantic instruction을 통일합니다

JSON syntax는 API별 structured-output 문법에 맞게 달라도 됩니다.

하지만:

```text
무엇을 추출할지
근거를 어떻게 요구할지
unknown을 어떻게 처리할지
eligibility label이 무엇인지
```

는 동일해야 합니다.

### Native track과 Controlled track을 섞지 않습니다

예를 들어:

```text
Upstage Parse + Extract + 후처리
vs
GPT에 PDF 한 번 전달
```

을 비교했다면 이것은 **"최종 pipeline 비교"**이지 parser model 비교가 아닙니다.

둘 다 유용하지만 이름을 정확히 붙여야 합니다.

### Conversion penalty를 숨기지 않습니다

HWP를 직접 못 받는 서비스에서:

```text
HWP → PDF
```

변환이 필요하다면 그것도 workflow의 일부입니다.

기록할 것:

```text
conversion success
conversion latency
conversion cost
layout degradation
manual steps
```

Upstage는 공식적으로 HWP/HWPX 자동 변환을 명시하고 있으므로 이 조건은 native capability로 그대로 평가할 수 있습니다. citeturn15search1

### Adapter는 문법만 바꿔야 합니다

각 provider 결과를 canonical JSON으로 바꾸는 adapter에서:

```text
HTML → cell JSON
polygon normalization
field rename
```

은 허용합니다.

하지만:

```text
누락된 table cell 추론
날짜 보정
잘못된 heading 수정
LLM으로 post-correction
```

은 금지합니다.

그 순간 adapter 자체가 benchmark participant가 됩니다.

### 실패와 retry를 삭제하지 않습니다

API timeout, malformed JSON, safety refusal, unsupported file은 모두:

```text
failure
```

로 기록합니다.

retry했다면:

```text
retry count
final success
added latency
added cost
```

까지 포함합니다.

### 무료 tier는 Cost에서 빼지 않습니다

Promotional credit이 있다고 비용을 0으로 계산하면 production benchmark가 아닙니다.

Benchmark 날짜의 공식 list price 또는 실제 billable usage를 사용하고:

```text
pricing date
region
service tier
batch/online mode
```

를 기록하세요.

예를 들어 GPT-5.6 Sol은 현재 promotional pricing 기간이 명시되어 있어 가격 자체가 앞으로 변할 수 있습니다. 따라서 slide에는 **"Pricing snapshot: 2026-08-22"**를 명시하는 것이 안전합니다. citeturn16search3turn16search19

### LLM-as-a-judge를 핵심 점수에 쓰지 않습니다

Deadline:

```text
exact date
```

Eligibility:

```text
exact class
```

Required docs:

```text
set F1
```

Table:

```text
cell/span
```

Text:

```text
edit distance
```

처럼 deterministic scoring이 가능한 곳은 deterministic metric을 사용합니다.

LLM judge는:

```text
figure description quality
alt text adequacy
애매한 자연어 설명
```

정도에만 쓰고, 가능하면 사람 2명이 판단합니다.

### 범용 LLM에게 web/search를 주지 않습니다

Gemini에는 Google Search grounding 기능 등이 제공되지만 이 benchmark에서는 끕니다. 그렇지 않으면 문서에서 읽은 것인지 인터넷에서 찾은 것인지 알 수 없습니다. Google은 Gemini의 Search grounding을 별도 tool capability로 제공합니다. citeturn15search11

### 문서 단위 macro average를 우선합니다

80페이지 문서 하나에 extraction field가 60개 있고 4페이지 문서에 5개가 있다고 해서 80페이지 문서가 전체 점수를 지배하게 두지 마세요.

두 값을 같이 표시하는 것이 좋습니다.

```text
Micro score:
전체 field aggregate

Macro score:
document별 score의 평균
```

**메인 숫자는 Macro**, diagnostics는 Micro를 추천합니다.

## 공식 Benchmark와 근거 자료

**K. 공식 Benchmark 출처**

현재 공개 document benchmarks 가운데 하나만으로 Unfold의 문제를 그대로 평가하기는 어렵습니다.

OmniDocBench는 PDF parsing과 reading order, DocLayNet은 layout, PubTables는 table structure, OCRBench는 multimodal OCR, KIEval은 structured extraction을 각각 잘 다룹니다. 하지만 **한국 장학금/지원 공고, HWP/HWPX, 자격 판정, 정정공고, 첨부문서 precedence, hallucinated deadline을 하나의 end-to-end safety benchmark로 묶은 것은 아닙니다.** 따라서 이들의 metric을 가져오되 Unfold-specific GT를 추가하는 방식이 적합합니다. citeturn18search0turn18search1turn18search22turn18search19turn19search0

### 공개 Benchmark

| Benchmark | 무엇을 참고할지 | Unfold 적용 |
|---|---|---|
| **OmniDocBench** | text, table, reading order, diverse PDF parsing | Metric 1, 2, 4의 기본 참고 |
| **DocLayNet** | human-annotated layout bounding boxes, 11 classes | Metric 8, 9 |
| **PubTables-1M** | table detection, structure recognition, functional analysis | Metric 4, 5 |
| **PubTables-v2** | full-page, multi-page table extraction | 공공기관 multi-page table |
| **OCRBench v2** | OCR, localization, layout perception, reasoning | scan, Korean OCR-style visual task 설계 참고 |
| **KIEval** | entity + grouped information evaluation | 조건, 필요서류 구조화 |
| **UNIKIE-Bench** | LMM용 key information extraction benchmark | 최신 multimodal KIE 참고 |
| **WCAG PDF Techniques** | reading order, headings, tables, OCR, forms, alt text | Accessibility Reconstruction Readiness |

OmniDocBench는 현재 공개 repository 기준 1,651 PDF pages, 10개 document type, 5개 layout type, 5개 language type의 document parsing benchmark를 제공하며, 별도로 text/table/reading-order 같은 component를 평가합니다. citeturn18search0turn18search8

DocLayNet은 80,863개의 사람이 annotation한 페이지와 11개 layout class bounding boxes를 제공하며, annotation agreement를 검토할 수 있는 다중 annotation subset도 포함합니다. 이는 Unfold benchmark에서도 사람이 만드는 layout GT에 두 명의 확인자를 두어야 하는 좋은 근거가 됩니다. citeturn18search1

PubTables-1M은 table detection, table structure recognition, functional analysis를 위한 대규모 table dataset이고, 2025년에 공개된 PubTables-v2는 multi-page table을 포함하도록 범위를 확장했습니다. 특히 여러 페이지를 가로지르는 표는 Unfold의 공공기관 PDF 사례와 직접적으로 맞닿아 있습니다. citeturn18search18turn18search2

OCRBench v2는 10,000개의 human-verified QA pair와 OCR, text localization, layout perception, reasoning 등을 포함하고 있어 "범용 multimodal model이 문자를 볼 수 있다"와 "복잡한 document OCR을 안정적으로 한다"를 구분하는 데 참고할 만합니다. citeturn18search3turn18search19

KIEval은 industrial document KIE가 개별 entity뿐 아니라 grouped structure를 제대로 추출했는지 평가하도록 설계되었습니다. 장학금 지원 조건처럼 "조건명, threshold, 적용대상, 예외"가 한 묶음이어야 하는 문제에 특히 잘 맞는 아이디어입니다. citeturn19search0

W3C의 PDF accessibility techniques는 OCR text, logical reading order, image alternatives, headings, table semantics, form labels 등을 각각 별도 요소로 다룹니다. 따라서 Unfold의 20번 metric은 단순한 "Markdown이 보기 좋은가"보다 이러한 재구축 ingredient를 얼마나 정확히 제공하는지를 측정하는 방향이 타당합니다. citeturn19search6turn19search1turn19search2turn19search4turn19search20

### Vendor 공식 문서에서 확인할 Benchmark 조건

Upstage에는 multi-page table stitching, 회전 문서, HWP/HWPX ingestion 같은 document-specific capability가 공식적으로 명시되어 있습니다. 따라서 이를 benchmark stratum에 넣는 것은 Upstage에게 특혜를 주는 것이 아니라 **제품이 주장하는 실제 사용상의 이점을 검증하는 것**입니다. citeturn15search1

반대로 OpenAI에는 PDF visual processing, Gemini에는 최대 1,000페이지 PDF document understanding, Claude에는 text와 image를 함께 처리하는 PDF support가 있으므로 clean PDF와 long-document reasoning을 반드시 포함해야 범용 multimodal model에도 공정합니다. citeturn16search1turn15search0turn15search3

Azure, Google Cloud Document AI, AWS Textract는 모두 source geometry나 structured document elements를 제공할 수 있으므로 **Upstage의 진짜 비교 상대는 GPT/Gemini/Claude만이 아닙니다.** 특히 Unfold가 source coordinates, merged table cells, checkbox, accessibility reconstruction을 중요하게 생각한다면 이 세 전문 Document AI 계열 중 최소 하나는 2시간 benchmark에, 가능하면 세 개 모두 발표용 benchmark에 포함하는 편이 객관적입니다. citeturn17search22turn17search23turn17search2

### 최종적으로 권하는 해커톤 판정 기준

발표의 결론은 **"총점이 가장 높은 provider"**가 아니라 아래 순서로 내리는 것이 가장 설득력 있습니다.

```text
Critical Safety
    ↓
Wrong Deadline / False Eligibility / Hallucination이 있는가?

Critical Accuracy
    ↓
조건, 기한, 필수서류, 자격 판정이 맞는가?

Traceability
    ↓
Page와 source coordinates로 검증 가능한가?

Document Robustness
    ↓
Scan, HWP, 복잡한 표, 긴 문서, 첨부문서에서도 유지되는가?

Operations
    ↓
Latency, cost, repeatability는 production에 적합한가?
```

그리고 발표 마지막 문장은 다음 정도가 가장 안전합니다.

> **"본 결과는 2026년 8월 22일 기준의 모델/API와 Unfold가 선정한 10~12개의 대표 행정, 지원 문서를 대상으로 한 task-specific benchmark입니다. 따라서 특정 provider가 모든 Document AI 업무에서 일반적으로 우월하다는 의미는 아닙니다. 다만 이 테스트 범위에서는 어떤 제품이 구조 정확도, 행정상 critical error, source grounding, 비용과 latency에서 더 적합한지를 직접 비교할 수 있었습니다."**

Upstage가 실제로 우세하게 나왔다면:

> **"이 테스트 범위에서는 Upstage가 특히 복잡한 문서 구조와 source traceability에서 유의미한 실무상 이점을 보였습니다. 반면 semantic reasoning에서는 범용 multimodal 모델과의 차이가 작거나 일부 항목에서 열세였으며, 따라서 '모든 문서 이해에서 우월하다'기보다 Unfold의 정확도 민감형 document ingestion layer에 적합하다는 수준으로 해석했습니다."**

반대로 GPT/Gemini/Claude가 비슷하거나 더 좋았다면:

> **"이 테스트 범위에서는 범용 multimodal 모델만으로도 Unfold의 주요 행정문서 처리 요구사항을 상당 부분 충족했으며, Upstage를 별도 계층으로 도입했을 때의 정확도 개선이 추가 비용과 복잡성을 정당화할 만큼 크지는 않았습니다. 다만 HWP, source coordinates, 복잡한 표 등 일부 문서군에서는 차이가 관찰됐습니다."**

이렇게 설계하면 최종 결과가 어느 쪽으로 나오더라도 **"Upstage를 홍보하기 위한 benchmark"가 아니라 "Unfold에서 Document AI가 실제로 필요한 지점을 찾아내는 benchmark"**가 됩니다.