# 제품 Acceptance Criteria

기능 완료와 구현 판단의 최종 기준이다.

# 99. 구현 Definition of Done

## Entry
- [ ] Demo URL에서 Overlay 표시
- [ ] Overlay가 Side Panel을 연다

## Documents
- [ ] 현재 페이지의 첨부문서를 발견한다
- [ ] 사용자 선택 전 업로드하지 않는다
- [ ] 선택/동의 후 Agent에 전달한다

## Agent
- [ ] v0.22로 Job 생성
- [ ] `include=all` 결과 처리
- [ ] Parse/Classify/Extract/Instruct를 canonical data로 저장

## Guidance
- [ ] 주요 조건
- [ ] 마감
- [ ] 제출물
- [ ] 주의사항
- [ ] Next Action 표시

## Quick Check
- [ ] Quick Question을 Agent output으로 만든다
- [ ] Select options를 Agent data에서 가져온다
- [ ] 중복 질문 제거
- [ ] 필수/선택 구분
- [ ] 조건별 결과 표시
- [ ] 미입력 조건 표시

## Evidence
- [ ] Parse element에 Source ID 생성
- [ ] Guidance/Decision source와 연결
- [ ] 존재하지 않는 Source ID는 표시하지 않음

## Viewer
- [ ] PDF 렌더
- [ ] HWP/HWPX 렌더 또는 안정적 fallback
- [ ] XLSX readonly 렌더
- [ ] Outline navigation
- [ ] Evidence Highlight
- [ ] source click → 해당 위치 이동

## Accessibility
- [ ] Semantic View
- [ ] Heading 구조
- [ ] Table semantic
- [ ] Keyboard navigation
- [ ] VoiceOver로 핵심 demo flow 탐색

## Reliability
- [ ] Side Panel reopen 시 processing resume
- [ ] 동일 파일 cache 재사용
- [ ] Network error retry
- [ ] API Key / 원문 console logging 없음

---

---

# 100. 구현 판단 원칙

기능을 추가할 때 아래 순서로 판단한다.

### 1. 이미 Agent가 뽑은 데이터인가?
그렇다면 새 AI 호출 없이 UI에서 먼저 재사용한다.

### 2. deterministic하게 처리할 수 있는가?
그렇다면 LLM에 넘기지 않는다.

### 3. Search가 해결할 문제인가?
전체 문서 재추출 대신 retrieval을 사용한다.

### 4. Solar가 필요한가?
자연어 의미 판단이나 복합 조건에만 사용한다.

### 5. 근거로 돌아갈 수 있는가?
사용자에게 중요한 판단이라면 Source ID가 없으면 최종 결과로 확정하지 않는다.

---

---

# 101. 최종 기술 원칙

```text
Studio
= 문서를 구조화하고 핵심 사실을 준비한다.

Extension
= Case를 조직하고 문서 경험을 연결한다.

Search
= 어디를 볼지 좁힌다.

Solar
= 근거 범위 안에서 의미를 판단한다.

Source Registry
= 모든 판단을 원문으로 되돌린다.

Viewer
= 같은 문서를 시각적·구조적·접근 가능한 방식으로 탐색하게 한다.
```

최종 제품 원칙:

> Intelligence should not hide the document. It should unfold it.

그리고 구현 수준의 가장 중요한 invariant는 다음이다.

> Every Answer Has a Place.
