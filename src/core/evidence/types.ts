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
  html?: string;
  markdown?: string;
  polygon?: Point[];
  wordCoordinates?: Point[][];
  confidence?: number;
  semanticNodeId?: string;
}

export interface ParseSourceOptions {
  caseId: string;
  documentId: string;
  html: string;
}

export interface ExtractLocation {
  rawValue: string;
  page: number;
  coordinates: Point[];
  wordCoordinates: Point[][];
  confidence?: number;
}

export interface ExtractLocationMapping extends ExtractLocation {
  sourceIds: string[];
  unresolved: boolean;
}

export interface InstructCitation {
  index: number;
  sourceType: string;
  sourceRef: string;
  page: number;
  coordinates: Point[];
  wordCoordinates: Point[][];
}

export interface CitationResolution {
  index: number;
  sourceIds: string[];
  unresolved: boolean;
}

export interface SourcePreview {
  fileName: string;
  page: number;
  text: string;
}

export interface EvidenceValidationResult {
  valid: string[];
  invalid: string[];
  insufficient: boolean;
}
