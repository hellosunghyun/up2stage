export type DocumentRole =
  | "primary_notice"
  | "requirements_checklist"
  | "application_form"
  | "procedure_guide"
  | "reference_material"
  | "amendment_update"
  | "other";

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
    | "pdf"
    | "hwp"
    | "hwpx"
    | "xlsx"
    | "unsupported";

  createdAt: number;
}

export interface CaseRecord {
  id: string;

  sourcePage: {
    url: string;
    title: string;
    normalizedUrl: string;
  };

  status:
    | "discovered"
    | "ready"
    | "processing"
    | "processed"
    | "failed";

  selectedDocumentIds: string[];

  agentJobId?: string;
  vectorStoreId?: string;

  createdAt: number;
  updatedAt: number;
}

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

export interface OutlineNode {
  id: string;
  documentId: string;

  type:
    | "heading"
    | "paragraph"
    | "list"
    | "table"
    | "figure";

  level?: number;

  label: string;
  sourceId: string;

  children?: OutlineNode[];
}

export interface SemanticNode {
  id: string;
  sourceId: string;

  type:
    | "heading"
    | "paragraph"
    | "ordered-list"
    | "unordered-list"
    | "table"
    | "figure"
    | "caption";

  level?: number;
  text?: string;

  children?: SemanticNode[];
}
