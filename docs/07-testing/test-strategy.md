# Test Strategy

Fixture, Viewer, Extension E2E, 접근성 검증을 정의한다.

# 92. Unit Test 필수 대상

- URL rule
- attachment discovery
- extension filter
- filename inference
- content hash
- Agent output parser
- `additional_values` parser
- Quick Question parser
- Quick Question dedupe
- Source ID generation
- Source Registry lookup
- SectionChunker
- numeric decision
- boolean decision
- date decision
- evidence validation
- conflict relation
- source coordinate transform

---

---

# 93. Integration Test

Fixture:

```text
공고문.pdf
자기소개서.hwp
참고 목록.xlsx
체크리스트.hwp
신청방법.pdf
```

확인:

```text
5 files
→ expected roles
→ expected canonical records
→ quick questions
→ initial guidance
→ source links
```

---

---

# 94. Viewer Test

### PDF
- page navigation
- zoom
- source highlight
- selected outline sync

### HWP
- render 성공
- source element navigation
- fallback semantic view

### XLSX
- large list rendering
- virtualization
- search/row navigation

---

---

# 95. Accessibility Test

자동:

```text
axe
```

수동:

- keyboard only
- VoiceOver
- visible focus
- heading navigation
- table announcement
- source click 후 semantic focus

---

---

# 96. E2E 시나리오

```text
Demo URL 진입
↓
Overlay 표시
↓
Open Panel
↓
Select 3 docs
↓
Consent
↓
Fixture Agent result load / mock
↓
Guidance
↓
Quick Form
↓
Answer
↓
Decision
↓
Source click
↓
Viewer
↓
Highlight
```

실제 API E2E와 fixture E2E를 분리한다.

Demo 직전에는 fixture fallback을 둘지 팀 내 결정.

---
