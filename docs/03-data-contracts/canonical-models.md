# Canonical Data Models

Raw API 타입이 아니라 제품이 소비하는 안정된 모델을 정의한다.

# 8. Case 모델

하나의 현재 페이지와 사용자가 선택한 문서 묶음을 `Case`로 본다.

```ts
export interface CaseRecord {
  id: string;

  sourcePage: {
    url: string;
    title: string;
    normalizedUrl: string;
  };

  status:
    | 'discovered'
    | 'ready'
    | 'processing'
    | 'processed'
    | 'failed';

  selectedDocumentIds: string[];

  agentJobId?: string;
  vectorStoreId?: string;

  createdAt: number;
  updatedAt: number;
}
```

Case는 장학금이라는 도메인에 종속되지 않는다.

---

---

# 9. Document 모델

```ts
export type DocumentRole =
  | 'primary_notice'
  | 'requirements_checklist'
  | 'application_form'
  | 'procedure_guide'
  | 'reference_material'
  | 'amendment_update'
  | 'other';

export interface DocumentRecord {
  id: string;
  caseId: string;

  originalUrl?: string;
  fileName: string;
  mimeType?: string;
  extension: string;
  size?: number;

  contentHash: string;

  role?: DocumentRole;
  roleConfidence?: number;

  upstageFileId?: string;

  renderType:
    | 'pdf'
    | 'hwp'
    | 'hwpx'
    | 'xlsx'
    | 'unsupported';

  createdAt: number;
}
```

`contentHash`는 cache key로 사용한다.

```text
SHA-256(file bytes)
```

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

# 57. Outline 데이터 생성

Parse Element categories 기반으로 구조 tree 생성.

```ts
export interface OutlineNode {
  id: string;
  documentId: string;

  type:
    | 'heading'
    | 'paragraph'
    | 'list'
    | 'table'
    | 'figure';

  level?: number;

  label: string;
  sourceId: string;

  children?: OutlineNode[];
}
```

P0에서는 완벽한 계층 추론보다 순서와 heading level 보존이 우선.

---

---

# 71. Semantic Node

```ts
interface SemanticNode {
  id: string;
  sourceId: string;

  type:
    | 'heading'
    | 'paragraph'
    | 'ordered-list'
    | 'unordered-list'
    | 'table'
    | 'figure'
    | 'caption';

  level?: number;
  text?: string;

  children?: SemanticNode[];
}
```

---
