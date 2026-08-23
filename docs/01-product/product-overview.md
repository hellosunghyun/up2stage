# 제품 개요

이 문서는 문제 정의와 P0 범위를 고정한다.

# 0. 문서 목적

이 문서는 Up to Stage를 실제로 구현하기 위한 개발 기준 문서다.

프로덕트의 핵심은 사용자가 현재 보고 있는 웹페이지와 그 페이지에 연결된 여러 문서를 직접 하나씩 열고 비교하지 않아도, Up to Stage가 문서의 역할과 구조를 이해하고 핵심 정보를 정리하며, 사용자의 질문이나 상황 판단이 실제 원문의 근거로 다시 연결되도록 만드는 것이다.

이 문서의 범위는 다음을 포함한다.

1. Chrome Extension 구조
2. URL Rule 기반 Contextual Overlay
3. 현재 페이지의 첨부문서 발견
4. 문서 선택 및 외부 AI 전송 동의
5. Upstage Agent v0.22 실행 및 결과 정규화
6. Initial Guidance
7. Dynamic Quick Question
8. 사용자 조건 기반 판단
9. Section Chunking
10. Upstage Search
11. Solar 기반 자유 질문
12. Source Registry와 Evidence Model
13. PDF / HWP(HWPX) / XLSX Viewer
14. 원문 Highlight
15. Accessible Semantic View
16. Side Panel과 Viewer Page의 상세 Layout
17. Local Cache / 상태 관리
18. 오류 처리
19. 개인정보 및 보안
20. 테스트 및 Definition of Done

이 문서는 해커톤 P0 구현을 우선하지만, P0 구현이 이후 Document Context Layer로 확장될 수 있도록 데이터 경계와 모듈 경계를 명확하게 둔다.

---

---

# 1. 제품 정의

## 1.1 해결하려는 문제

Up to Stage가 해결하는 문제는 "긴 문서를 읽기 어렵다"가 아니다.

실제 사용자는 하나의 기회를 판단하기 위해 다음을 동시에 수행해야 한다.

- 현재 웹페이지에서 관련 문서를 발견한다.
- PDF, HWP, HWPX, XLSX 등의 파일을 각각 연다.
- 각 문서가 어떤 역할인지 이해한다.
- 신청 자격, 마감, 제출서류, 예외, 작성 규칙을 비교한다.
- 자신의 상황을 조건에 대입한다.
- 중요한 판단의 원문 근거를 다시 확인한다.

따라서 핵심 문제는 다음과 같다.

> 여러 문서에 흩어진 정보를 하나의 행동 가능한 판단으로 통합해야 한다.

Up to Stage는 이를 다음 과정으로 바꾼다.

```text
Discover
→ Understand
→ Verify
→ Act
```

---

---

# 2. P0 범위와 비범위

## 2.1 P0에서 반드시 구현

### Browser Entry
- Chrome Extension
- 현재 Tab URL 확인
- URL Rule 기반 Contextual Overlay
- 현재 페이지의 첨부문서 링크 탐색
- Side Panel 열기

### Side Panel
- API Key 설정
- 관련 문서 발견
- 문서 선택
- 외부 AI 처리 동의
- Agent Job 생성
- Processing 상태
- Initial Guidance
- Quick Question Form
- 입력 확인
- 조건별 Decision
- 추천 질문 Chip
- 자유 질문 Chat

### Document Intelligence
- Agent v0.22
- `include=all` 기준 Parse/Classify/Extract/Instruct 결과 수신
- Parse Element Registry
- Extract 결과 정규화
- Quick Question 정규화 및 중복 제거
- Initial Guidance
- Section Chunking
- Upstage Search
- Solar
- Evidence Source ID validation

### Viewer
- 독립 Extension Viewer Page
- Document Selector
- Document Outline
- PDF Renderer
- HWP/HWPX Renderer
- XLSX Readonly Renderer
- Evidence Overlay
- Source Highlight
- Summary / Evidence Panel
- Accessible Semantic View
- Keyboard Navigation
- Screen Reader Friendly Structure

### Storage
- IndexedDB 기반 Case Cache
- Document/Parse/Extract/Source/Question/Answer 저장
- 동일 문서 재처리 최소화

---

## 2.2 P0에서 하지 않음

다음은 P0에서 구현하지 않는다.

- 문서 편집
- HWP/DOCX/PPTX를 완전한 Office Editor 수준으로 재현
- 모든 포맷의 native text drag selection
- 인터넷 전체 문서 crawling
- 백그라운드 상시 변경 감지
- 기관용 Embed SDK
- 서버 운영
- 계정 기반 Cloud Sync
- 완전 자동 행정 신청
- 모든 문서 충돌의 자동 해결
- 모든 WCAG/PDF-UA 문제 자동 remediation

---
