# 발표 자료 텍스트와 발표자 노트

원본: `presentation-with-notes.pptx`

## Slide 1: Min Hyeok Lee · Sung hyun Kim · Si Won Lee

### 화면 텍스트

- Min Hyeok Lee · Sung hyun Kim · Si Won Lee
- ·
- Powered by
- Project
- U
- nfold
- P
- ages to
- S
- tructured,
- T
- rusted,
- A
- ccessible
- G
- uidance for
- E
- veryone.
- TEAM GOODMORNING

### 발표자 노트

“Unfold Pages to Structured, Trusted, Accessible Guidance for Everyone.”
안녕하세요. 저희는 프로젝트 UP to STAGE를 소개하게 된 Team GOODMORNING 입니다.
Min Hyeok Lee / Sunghyun Kim / Si Won Lee
저희 프로젝트의 출발점은 하나의 문장이었습니다.

## Slide 2: Min Hyeok Lee · Sung hyun Kim · Si Won Lee

### 화면 텍스트

- Min Hyeok Lee · Sung hyun Kim · Si Won Lee
- ·
- Powered by
- Project
- U
- nfold
- P
- ages to
- S
- tructured,
- T
- rusted,
- A
- ccessible
- G
- uidance for
- E
- veryone.
- TEAM GOODMORNING

### 발표자 노트

“Unfold Pages to Structured, Trusted, Accessible Guidance for Everyone.”
안녕하세요. 저희는 프로젝트 UP to STAGE를 소개하게 된 Team GOODMORNING 입니다.
Min Hyeok Lee / Sunghyun Kim / Si Won Lee
저희 프로젝트의 출발점은 하나의 문장이었습니다.

## Slide 3: Opportunity for Everyone.

### 화면 텍스트

- Opportunity for Everyone.
- Existing ≠ Accessible
- Target Value
- Opportunityㅤ
- Discoverㅤ
- Understandㅤ
- Verifyㅤ
- Actㅤ
- User
- ㅤ

### 발표자 노트

저희가 처음 가지고 있던 생각은 간단했습니다.
"Opportunity for Everyone."
기회는 모두에게 제공되어야 한다고 생각했습니다.
그런데 기회가 존재한다는 것과,
누구나 그 기회를 발견하고 이해하고 실제로 행동할 수 있다는 건 다릅니다.
Discover, Understand, Verify, Act
기회에 누군가에게 도달하려면 이 모든 과정이 필요합니다.
저희는 그 사이에서 사람이 놓치는 지점을 문제로 봤습니다.

## Slide 4: Target Problem

### 화면 텍스트

- Target Problem
- One opportunity.
- Fragmented guidance.
- Web Page | PDF · HWP | Forms | Checklists | Reference Tables | Procedure Guides
- Many Documents
- One Decision

### 발표자 노트

그래서 저희는 대학생이 실제로 기회를 마주치는 과정을 봤습니다.
하나의 장학금이나 지원사업에 신청하려고 해도
정보는 웹페이지, PDF, HWP, 신청서, 기준표와 체크리스트로 나뉘어 있습니다.
사용자는 이것들을 직접 찾고, 열고, 서로 비교한 다음
결국 하나의 결정을 만들어야 합니다.
그래서 저희가 정의한 문제는 "긴 문서를 읽기 어렵다"가 아닙니다.
여러 문서에 흩어진 정보를 하나의 행동 가능한 판단으로 통합해야 한다는 것입니다.

## Slide 5: Slide 5

### 화면 텍스트

- (텍스트 없음)

### 발표자 노트

실제로 저희가 오늘 데모에 사용하는 공고입니다.(대략적인 공고 설명)

## Slide 6: One page

### 화면 텍스트

- One page
- Five docuents
- One decision
- Am I eligible?
- When is the deadline?
- What do I need?
- Where is the evidence?
- One page
- Five docuents
- One decision
- Am I eligible?
- When is the deadline?
- What do I need?
- Where is the evidence?

### 발표자 노트

게시글은 하나지만, 사용자가 판단을 내리려면 역할이 다른 여러 첨부문서를 함께 봐야 합니다.그런데 사용자가 궁금한 것은 파일 각각의 요약이 아닙니다.
"내가 지원할 수 있는지, 언제까지 무엇을 준비해야 하고, 그 근거가 어디 있는지"입니다.

## Slide 7: 1 - Upstage Technology Implementation

### 화면 텍스트

- 1 - Upstage Technology Implementation
- Document
- Parse
- Structure
- Document
- Classify
- Role
- Information
- Extract
- Facts
- Section Chunking
- Sections
- Upstage Search
- Context
- Upstage Solar 4
- Reasoning
- We don't ask one LLM to read everything.

### 발표자 노트

이를 위해 저희는 문서 전체를 한 번에 LLM에게 넘기지 않았습니다.
Upstage의 각 기술에 명확하게 다른 책임을 부여했습니다.
Document Parse가 문서들의 표, 페이지와 좌표를 식별하고 구조화하며,
Classify가 각 문서의 역할을 판단합니다.
Extract가 역할에 필요한 정보만 구조적으로 뽑고,
Search가 질문과 관련된 범위를 좁힌 뒤 Solar가 질문에 맞는 답변과 판단의 근거를 제공합니다.

## Slide 8: 1 - Upstage Technology Implementation

### 화면 텍스트

- 1 - Upstage Technology Implementation
- Classify → Role-specific Extract
- Different Documents Need Different Intelligence.
- Core Notice
- Eligibility Rules
- Self-checklist
- Application Form
- Procedure Guide
- Benefits · Dates
- Conditions · Exceptions
- Checks · Failure Conditions
- Fields
- Steps · Rules

### 발표자 노트

여기서 중요한 점은 문서마다 같은 (추출양식 즉,)Extraction Schema를 사용하지 않는다는 것입니다.
예를 들어 공고에서는 혜택과 일정을 보고,
자격 기준에서는 조건과 예외를 보고,
신청서는 입력 항목을 봅니다.
즉 Classify가 문서의 역할을 구분하고, 그 역할에 맞는 Extract를 연결하는 Agent 구조입니다.

## Slide 9: 1 - Upstage Technology Implementation

### 화면 텍스트

- 1 - Upstage Technology Implementation
- Search finds where to look.
- Solar finds what matters.
- Upstage Search
- Document
- ↓
- Section Chunk
- Relevant Section
- ↓
- Candidate Elements
- ↓
- Solar Pro 4
- ↓
- Evidence
- Heading
- Numbered Structure
- Tables / Lists
- Length

### 발표자 노트

긴 문서는 다시 Section 단위로 나눠 Search에 넣습니다.
Heading이 있다면 Heading을 사용하지만, H2가 없는 문서도 있기 때문에
번호 구조, 표와 목록, 길이 같은 경계를 함께 사용합니다.
그리고 중요한 건 Search 자체를 최종 근거로 사용하지 않는다는 점입니다.
Search는 "어디를 봐야 하는지"를 좁히고,
그 범위 안에서 Solar가 실제 원문 element를 선택합니다.

## Slide 10: 1 - Upstage Technology Implementation

### 화면 텍스트

- 1 - Upstage Technology Implementation
- Extracted Fact
- ↓
- Source ID
- AI Decision
- Source Highlight
- Accessible View
- Every Answer Has a Place.
- Document → Page → Element → Polygon

### 발표자 노트

이 원본 element에는 하나의 Source ID를 부여합니다.
그리고 같은 Source ID를 AI의 판단, 원문 Highlight, Accessible View가 함께 사용합니다.
그래서 사용자가 어떤 결과를 보더라도
"이 판단이 실제로 어디에서 나온 것인지" 다시 원문으로 돌아갈 수 있습니다.
Every Answer Has a Place.

## Slide 11: 2 - SERVICE COMPLETENESS

### 화면 텍스트

- 2 - SERVICE COMPLETENESS
- 실제 유저 플로우 데모 스크린샷

### 발표자 노트

실제 사용자 Flow는 이렇게 단순합니다.
현재 보고 있는 페이지에서 관련 문서를 발견하고 선택합니다.
(고정 데모 URL에서 Contextual Overlay 스크린샷 표시)
(관련 문서 목록 → 선택 화면 전환)
처리가 끝나면 사용자는 "핵심 안내 보기"와 "구조화 문서 직접 탐색" 중 하나를 선택할 수 있습니다.
(두 개의 선택지 화면)
먼저 핵심 안내에서는 마감, 조건, 제출 서류와 지금 해야 할 일을 확인합니다.
(Overview 화면)
그리고 "나는 지원할 수 있나요?" Quick Action을 선택합니다.
(Quick Action → 간단한 개인정보가 아닌 조건 입력 Form)
자신의 상황을 입력하면 조건별 충족 여부와 실제 근거를 확인할 수 있습니다.
(결과 화면에서 근거 표시)

## Slide 12: 3 - IDEA CREATIVITY

### 화면 텍스트

- 3 - IDEA CREATIVITY
- Accessibility 데모에 대한 설명 장표

### 발표자 노트

그리고 저희가 중요하게 본 또 하나는 접근성입니다.
AI가 문서를 정확하게 이해하기 위해 복원한 구조라면,
AI가 문서의 맥락을 완벽히 파악해 만들어낸 이 구조는
그 구조는 AI만 사용할 이유가 없습니다.
저희는 원본 Visual Source 위에 제목, 표, 목록과 읽기 순서를 가진 Semantic Accessibility Layer를 만들고,
그 위에 문서가 사용자에게 어떤 의미인지 알려주는 Intelligence Guidance Layer를 더했습니다.

## Slide 13: 3 - IDEA CREATIVITY

### 화면 텍스트

- 3 - IDEA CREATIVITY
- Accessibility 데모 영상

### 발표자 노트

(15초 영상 시작)
(원본 문서 위에 세 레이어가 차례대로 나타남)
(키보드로 Heading Navigation)
"지원 자격, Heading Level 2."
(원문 해당 영역 Highlight)
"네 개의 주요 조건이 있습니다. 학년, 지원구간, 성적, 소속 대학 조건입니다."
(영상 종료)

## Slide 14: 3 - IDEA CREATIVITY

### 화면 텍스트

- 3 - IDEA CREATIVITY
- The capabilities exist.
- The difference is how they connect.
- Product experience comparison, not a model benchmark.
- Experience
- ChatGPT
- Gemini Notebook
(NotebookLM)
- Adobe Acrobat AI
- Microsoft
Copilot
- UP²STAGE
- Current Page
- ●
- —
- —
- ●
- ●
- Attachment Set
- △
- —
- —
- △
- ●
- Role-aware Analysis
- △
- △
- △
- △
- ●
- Source Navigation
- △
- ●
- ●
- △
- ●
- Semantic Navigation
- —
- —
- ○
- —
- ●
- Shared Evidence Layer
- —
- —
- △
- —
- ●

### 발표자 노트

론 이 기능들 하나하나가 세상에 처음 존재하는 것은 아닙니다.
ChatGPT, Gemini Notebook, Acrobat AI 등의 AI 프로덕트가 각각 잘하는 영역이 있습니다.
저희가 다르게 본 지점은 한 기능의 우열이 아니라,
현재 페이지의 문서 묶음부터 구조, 판단, 원문 Highlight와 접근성까지
하나의 Evidence Layer로 연결하는 제품 경험입니다.

## Slide 15: 3 - IDEA CREATIVITY

### 화면 텍스트

- 3 - IDEA CREATIVITY
- STRUCTURED
- Understand the structure.
- TRUSTED
- Return to the evidence.
- ACCESSIBLE
- Navigate it your way.
- It should not hide the document.
- It should unfold it.

### 발표자 노트

결국 UP²STAGE가 만들고 싶은 것은 더 좋은 요약 하나가 아닙니다.
Structured.
문서의 구조를 이해합니다.
Trusted.
중요한 판단은 언제든 실제 근거로 돌아갈 수 있습니다.
Accessible.
그리고 같은 구조를 각자가 자신에게 맞는 방식으로 탐색할 수 있습니다.
Intelligence should not hide the document. It should unfold it.

## Slide 16: 4 - PRODUCT PLANNING

### 화면 텍스트

- 4 - PRODUCT PLANNING
- Start Narrow. Build for Expansion.
- TODAY
- NEXT
- FUTURE
- Product Scope
- One Scholarship Workflow
- More Student Workflows
- Public Document Workflows
- User Experience
- Analyze from the Current Page
- Resume with Existing Context
- Guidance Available at the Source
- Product Intelligence
- Build Context on Demand
- Reuse Document Context
- Continuously Maintained Context
- Processing
- Analyze + Cache
- Skip Unnecessary Reprocessing
- Refresh Only Changed Documents
- Accessibility
- Accessible Document View
- Reusable Semantic Structure
- Accessible by Default
- Distribution
- Chrome Extension
- Institutional Pilots
- Embedded · API · B2B/B2G

### 발표자 노트

3일이라는 제한된 시간 안에서는 의도적으로 장학금이라는 하나의 Workflow에 집중했습니다.
지금의 데모는 사용자가 현재 보고 있는 페이지에서 UP²STAGE를 실행하고, 필요한 문서들을 그때 분석해서 하나의 End-to-End 경험을 완성하는 단계입니다. 같은 문서는 Cache를 활용해 불필요한 반복 처리를 줄입니다.
(장표의 NEXT로 이동)
Next에서는 단순히 장학금 문서 처리를 하는 것이 아니라, 한 번 이해한 문서의 구조와 근거, 접근성 정보를 Document Context로 재사용합니다.
그러면 기숙사, 교환학생, 인턴십처럼 Workflow가 달라져도 이미 이해한 문서를 다시 처음부터 처리하지 않고 이어서 사용할 수 있습니다.
(배경 marquee가 천천히 움직임)
장기적으로는 이 Context가 일회성 분석 결과가 아니라 계속 유지되는 구조가 됩니다.
원본 문서가 변경됐을 때 필요한 부분만 다시 분석하고, 여러 Workflow가 같은 Document Context를 공유할 수 있습니다.
결국 저희가 확장하려는 것은 장학금 기능의 개수가 아니라, 다양한 문서 경험이 공통으로 사용할 수 있는 Document Layer입니다.
Today, users bring UP²STAGE to documents.
Future, documents can come with UP²STAGE.

## Slide 17: 4 - PRODUCT PLANNING

### 화면 텍스트

- 4 - PRODUCT PLANNING
- B2C
- Students
- Individuals
- Validate Demand
- Repeat Usage
- High-value Workflows
- Today
- User brings UP²STAGE
- to the site.
- B2B / B2G
- Universities Foundations Public Institutions
- Future
- Institution brings UP²STAGE
- to everyone.

### 발표자 노트

사업 측면에서도 저희는 B2C를 최종 목적지라기보다, 실제 수요를 검증하기 위한 시작점으로 보고 있습니다.
학생과 개인 사용자를 통해
정말 반복해서 사용하는지, 어떤 Workflow에서 가치가 큰지, 실제로 시간을 줄이고 중요한 실수를 줄이는지를 먼저 확인합니다.
그 이후에는 대학, 장학재단이나 공공기관처럼 문서를 제공하는 쪽도 고객이 될 수 있습니다.
지금은 사용자가 UP²STAGE를 사이트로 가져오지만,
(Chrome Extension 아이콘에서 기관 사이트로 시선 이동)
미래에는 기관이 간단한 integration을 통해 UP²STAGE를 방문자 모두에게 제공할 수도 있습니다.
그렇게 되면 BM이 존재하더라도, 실제 사용자는 별도의 비용을 내지 않고 정확하고 Accessible한 공공 문서 경험을 사용할 수도 있습니다.

## Slide 18: Opportunity for Everyone.

### 화면 텍스트

- Opportunity for Everyone.

### 발표자 노트

저희가 시작했던 문장으로 돌아가겠습니다.
"Opportunity for Everyone."
기회는 모두에게 제공되어야 하니까.

## Slide 19: Slide 19

### 화면 텍스트

- (텍스트 없음)

### 발표자 노트

(UP²STAGE 로고만 남기고 종료)
