# IndexedDB Schema 방향

테이블 이름, canonical state와 UI state의 경계를 정의한다.

# 74. Storage

Dexie schema 개념:

```text
cases
documents
parseElements
sources
extracts
guidance
quickQuestions
userAnswers
decisions
chunks
searchIndexes
chatMessages
conflicts
actionItems
```

---

---

# 75. Cache

## Document Cache Key

```text
contentHash
+
agentVersion
```

예:

```text
sha256(file) + "agent-v0.22"
```

동일하면 Agent 재처리하지 않는다.

Case마다 document relationship만 새로 연결.

---

---

# 76. Search Cache

```text
contentHash
+
chunkerVersion
```

Chunk text가 동일하면 Search Index를 재사용할 수 있게 구조를 둔다.

P0에서는 Case 단위 index라도 모델은 재사용 가능한 형태로 작성.

---

---

# 77. UI State vs Canonical State

### IndexedDB
- Case
- Documents
- Agent results
- Sources
- Answers
- User inputs
- Checklist state

### Zustand
- 현재 선택 tab
- panel state
- form draft
- open popover
- viewer zoom
- current source selection

Redux는 사용하지 않는다.

---
