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
