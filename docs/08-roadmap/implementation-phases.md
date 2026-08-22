# 구현 단계와 절대 우선순위

눈에 보이는 기능 단위로 구현·검증·커밋한다.

# 97. 구현 순서

## Phase 1 — Shell

1. WXT 프로젝트
2. Side Panel
3. Content Script
4. URL Overlay
5. Messaging
6. Viewer route

## Phase 2 — Discovery

7. DOM attachment discovery
8. Selection UI
9. Consent
10. file download

## Phase 3 — Agent

11. Upload client
12. Job submit
13. Job polling
14. Output Adapter
15. Dexie persistence

## Phase 4 — Guidance

16. Initial Guidance
17. Quick Question parser
18. Dynamic Form
19. Condition breakdown
20. Checklist/Caution UI

## Phase 5 — Evidence

21. Source Registry
22. Instruct citation adapter
23. navigateToSource

## Phase 6 — Viewer

24. Viewer Shell
25. Outline
26. PDF
27. HWP/HWPX
28. XLSX
29. Evidence Overlay

## Phase 7 — Retrieval

30. SectionChunker
31. Search
32. Solar
33. Evidence Validator

## Phase 8 — Accessibility

34. Semantic Tree
35. Accessible View
36. Keyboard
37. VoiceOver QA

---

---

# 98. 해커톤 시간 부족 시 절대 우선순위

반드시 살릴 것:

```text
URL Overlay
Side Panel discovery/select
Agent
Guidance
Quick Question
Decision Breakdown
Source Link
PDF Viewer Highlight
Accessible Semantic View
```

시간 부족 시 줄일 것:

```text
HWP pixel fidelity
XLSX 고급 UI
Chat history
복잡한 conflict UI
hover animation
고급 transition
native drag selection
```

---
