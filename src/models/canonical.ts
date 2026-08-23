export type DocumentRole =
  | "primary_notice"
  | "requirements_checklist"
  | "application_form"
  | "procedure_guide"
  | "reference_material"
  | "amendment_update"
  | "other";

export type CaseStatus =
  | "discovered"
  | "ready"
  | "processing"
  | "processed"
  | "failed";

export type DocumentRenderType =
  | "pdf"
  | "hwp"
  | "hwpx"
  | "xlsx"
  | "unsupported";

export type DocumentProcessingStatus =
  | "pending"
  | "downloading"
  | "download_failed"
  | "uploading"
  | "upload_failed"
  | "uploaded"
  | "analyzing"
  | "complete"
  | "failed";

export interface SourceLocation {
  page: number;
  coordinates: Array<{ x: number; y: number }>;
  wordCoordinates?: Array<Array<{ x: number; y: number }>> | undefined;
}

export interface CaseRecord {
  id: string;
  sourcePage: {
    url: string;
    title: string;
    normalizedUrl: string;
  };
  status: CaseStatus;
  selectedDocumentIds: string[];
  agentJobId?: string | undefined;
  agentStatus?: "queued" | "in_progress" | "completed" | "failed" | undefined;
  vectorStoreId?: string | undefined;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentRecord {
  id: string;
  caseId: string;
  originalUrl?: string | undefined;
  fileName: string;
  mimeType?: string | undefined;
  extension: string;
  size?: number | undefined;
  contentHash: string;
  role?: DocumentRole | undefined;
  roleConfidence?: number | undefined;
  pageRange?: [number, number] | undefined;
  upstageFileId?: string | undefined;
  renderType: DocumentRenderType;
  processingStatus: DocumentProcessingStatus;
  processingError?: string | undefined;
  createdAt: number;
}

export interface ParseElement {
  id: string;
  caseId: string;
  documentId: string;
  sourceId: string;
  elementId: string | number;
  category: string;
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "table"
    | "figure"
    | "caption"
    | "other";
  level?: number | undefined;
  page: number;
  html?: string | undefined;
  markdown?: string | undefined;
  text?: string | undefined;
  coordinates?: Array<{ x: number; y: number }> | undefined;
  wordCoordinates?: Array<Array<{ x: number; y: number }>> | undefined;
}

export interface ExtractFieldValue {
  field: string;
  value: string;
  confidence?: "high" | "medium" | "low" | undefined;
  confidenceScore?: number | undefined;
  page?: number | undefined;
  location?: SourceLocation | undefined;
}

export interface ExtractRecord {
  id: string;
  caseId: string;
  documentId: string;
  schemaName: string;
  values: ExtractFieldValue[];
  rawJson: Record<string, unknown>;
  additionalValues: Record<string, unknown>;
  pageRange?: [number, number] | undefined;
}

export interface Citation {
  index: number;
  sourceType: string;
  sourceRef: string;
  nodeIndex: number;
  page?: number | undefined;
  coordinates?: Array<{ x: number; y: number }> | undefined;
  wordCoordinates?: Array<Array<{ x: number; y: number }>> | undefined;
  sourceIds: string[];
}

export interface GuidanceRecord {
  id: string;
  caseId: string;
  overview: string;
  topRequirements: string[];
  nearestDeadline: string;
  requiredSubmissions: string[];
  topCautions: string[];
  nextActions: string[];
  missingInformation: string[];
  personalizationStatus: "not_evaluated";
  citations: Citation[];
}

export interface CanonicalAgentResult {
  caseId: string;
  agentJobId: string;
  status: "completed" | "failed";
  completedAt: number;
  documents: DocumentRecord[];
  parseElements: ParseElement[];
  sources: SourceRecord[];
  extracts: ExtractRecord[];
  guidance: GuidanceRecord | null;
  quickQuestions: QuickQuestionRecord[];
}

export interface Point {
  x: number;
  y: number;
}

export interface SourceRecord {
  sourceId: string;
  caseId: string;
  documentId: string;
  page: number;
  elementId: string | number;
  category: string;
  text: string;
  html?: string | undefined;
  markdown?: string | undefined;
  polygon?: Point[] | undefined;
  wordCoordinates?: Point[][] | undefined;
  confidence?: number | undefined;
  semanticNodeId?: string | undefined;
}

export type QuestionInputType =
  | "text"
  | "number"
  | "select"
  | "boolean"
  | "date"
  | "organization_select";

export type QuestionOrigin = "primary_notice" | "requirements_checklist";

export interface QuickQuestionRecord {
  id: string;
  caseId: string;
  key: string;
  label: string;
  inputType: QuestionInputType;
  required: boolean;
  options?: string[] | undefined;
  ruleText?: string | undefined;
  sourceIds: string[];
  confidence?: number | undefined;
  origin: QuestionOrigin;
}

export interface DocumentFileRecord {
  documentId: string;
  caseId: string;
  bytes: ArrayBuffer;
  mimeType?: string | undefined;
  createdAt: number;
}

export interface UserAnswerRecord {
  id: string;
  caseId: string;
  questionId: string;
  value: string | number | boolean | null;
  updatedAt: number;
}

export interface DecisionRecord {
  id: string;
  caseId: string;
  status: "eligible" | "ineligible" | "needs_more_information" | "conflict";
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface ActionItemRecord {
  id: string;
  caseId: string;
  label: string;
  completed: boolean;
  sourceIds: string[];
}

export interface ChunkRecord {
  id: string;
  caseId: string;
  documentId: string;
  role?: DocumentRole | undefined;
  sectionPath: string[];
  text: string;
  sourceIds: string[];
  pages: number[];
  contentHash: string;
}

export interface OutlineNode {
  id: string;
  documentId: string;
  type: "heading" | "paragraph" | "list" | "table" | "figure";
  level?: number | undefined;
  label: string;
  sourceId: string;
  children?: OutlineNode[] | undefined;
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
  level?: number | undefined;
  text?: string | undefined;
  children?: SemanticNode[] | undefined;
}
