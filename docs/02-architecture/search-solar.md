# Search · Solar · Conflict

Search는 후보 범위, Solar는 의미 판단, Registry는 최종 근거를 담당한다.

# 46. SectionChunker

Search 전에 Extension이 실행.

우선순위:

```text
1. Explicit Heading
2. Numbered Structure
3. Table/List Boundary
4. Length Boundary
```

지원 구조:

```text
1.
1-1.
가.
나.
①
②
제1조
붙임 1
```

페이지 경계만으로 chunk하지 않는다.

---

---

# 47. Chunk 크기

초기값:

```text
target: 700 tokens
max: 1200 tokens
min: 180 tokens
overlap: 120 tokens
```

정확한 값은 POC 후 조정.

---

---

# 48. Search Document

각 chunk를 retrieval용 Markdown으로 구성.

```md
# {document title}

Role: procedure_guide
Section: 신청 방법 > 제출 완료

{short retrieval context}

## 원문
...
```

Search용 title/summary는 근거가 아니다.

---

---

# 49. ChunkRecord

```ts
export interface ChunkRecord {
  id: string;
  caseId: string;
  documentId: string;

  role?: DocumentRole;

  sectionPath: string[];
  text: string;

  sourceIds: string[];
  pages: number[];

  contentHash: string;
}
```

---

---

# 50. Upstage Search

Search 역할:

> 어디를 봐야 하는지 좁힌다.

```text
Question
↓
Search
↓
Top K Section
```

기본:

```text
topK = 5
```

결과가 부족하면 최대 10.

Search result 자체는 Evidence로 쓰지 않는다.

---

---

# 51. Candidate Element Resolve

Search hit:

```text
chunkId
↓
ChunkRecord.sourceIds
↓
SourceRegistry
↓
Candidate SourceRecords
```

이 candidate들만 Solar에 제공한다.

---

---

# 52. Solar Contract

입력:

```text
user question
user profile, 필요한 경우
relevant extract facts
candidate source records
```

출력 예:

```ts
export interface SolarAnswer {
  answer: string;

  decision?: DecisionStatus;

  evidenceSourceIds: string[];

  missingInformation: string[];
  nextActions: string[];
}
```

Structured Output으로 제한하는 것이 좋다.

---

---

# 53. Evidence Validator

Solar 응답 후 반드시 검증.

```ts
for (const id of answer.evidenceSourceIds) {
  assert(sourceRegistry.has(id));
  assert(source.caseId === currentCase.id);
}
```

유효하지 않은 source ID가 있으면:

- 해당 citation 제거
- 핵심 답변이 근거 없이 남으면 사용자에게 답변하지 않음
- `insufficient_evidence` 처리

---

---

# 54. Conflict Detector

다문서 제품이므로 conflict를 first-class로 둔다.

관계:

```text
supports
duplicates
conflicts
supersedes
```

P0 자동 precedence:

```text
amendment_update가
명시적으로 target_document / changed item을 지목
→ supersedes
```

그 외:

```text
문서 A: 7월 29일 이후
문서 B: 3월 16일 이후

→ conflict
→ 사용자에게 둘 다 표시
```

임의로 "primary_notice가 무조건 진실"로 처리하지 않는다.

---
