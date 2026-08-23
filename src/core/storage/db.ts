import Dexie, { type Table } from "dexie";
import type {
  CaseRecord,
  DocumentRecord,
  ExtractRecord,
  GuidanceRecord,
  ParseElement,
} from "../../models/canonical";

export interface DocumentCacheRecord {
  id?: number;
  contentHash: string;
  agentVersion: string;
  upstageFileId: string;
  createdAt: number;
}

class Up2StageDB extends Dexie {
  cases!: Table<CaseRecord, string>;
  documents!: Table<DocumentRecord, string>;
  parseElements!: Table<ParseElement, string>;
  extracts!: Table<ExtractRecord, string>;
  guidance!: Table<GuidanceRecord, string>;
  documentCache!: Table<DocumentCacheRecord, number>;

  constructor() {
    super("up2stage");
    this.version(1).stores({
      cases: "&id, status, agentJobId",
      documents: "&id, caseId, [caseId+contentHash], contentHash, upstageFileId",
      parseElements: "&id, [caseId+documentId], caseId, sourceId",
      extracts: "&id, [caseId+documentId], caseId",
      guidance: "&id, caseId",
      documentCache: "++id, &[contentHash+agentVersion]",
    });
  }
}

export const db = new Up2StageDB();
