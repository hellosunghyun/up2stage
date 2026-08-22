# 사용자 흐름

현재 페이지 진입부터 근거 확인과 접근성 보기까지의 canonical flow다.

# 13. Side Panel State Machine

```ts
export type PanelState =
  | 'SETUP'
  | 'DISCOVERY'
  | 'SELECTION'
  | 'CONSENT_CONFIRM'
  | 'PROCESSING'
  | 'GUIDANCE'
  | 'QUICK_FORM'
  | 'QUICK_CONFIRM'
  | 'DECISION'
  | 'CHAT';
```

전이:

```text
SETUP
  ↓
DISCOVERY
  ↓
SELECTION
  ↓
CONSENT_CONFIRM
  ↓
PROCESSING
  ↓
GUIDANCE
  ├── QUICK_FORM
  │      ↓
  │   QUICK_CONFIRM
  │      ↓
  │   DECISION
  │
  └── CHAT
```

---

---

# 88. Demo Flow

실제 발표/데모 기준:

```text
1. 실제 공고 웹페이지 진입

2. URL Rule이 Contextual Overlay 표시
   "관련 문서를 함께 확인할 수 있어요"

3. Overlay CTA
   → Side Panel

4. 관련 문서 Discovery

5. 문서 선택 + AI 처리 고지

6. 분석 시작

7. Processing
   파일별 진행 상태

8. Initial Guidance
   주요 조건
   마감
   제출물
   주의사항

9. "내 조건 확인하기"

10. Agent quick_questions 기반 Dynamic Form

11. 입력 Confirm

12. 조건별 Decision
    충족
    미충족
    확인 필요

13. Source 클릭

14. Viewer Page 이동

15. Left Outline
    Center Original Document
    Right Evidence Summary

16. Source Highlight

17. Accessible View 전환

18. Keyboard / screen reader navigation
```

---
