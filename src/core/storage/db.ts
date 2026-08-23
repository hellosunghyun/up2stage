import Dexie, { type Table } from "dexie";
import type { AgentJob } from "../agent/types";
import type {
  CaseRecord,
  DocumentRecord,
  ExtractRecord,
  GuidanceRecord,
  ParseElement,
  SourceRecord,
  QuickQuestionRecord,
  DocumentFileRecord,
  UserAnswerRecord,
  DecisionRecord,
  ActionItemRecord,
} from "../../models/canonical";

export interface DocumentCacheRecord {
  id?: number;
  contentHash: string;
  agentVersion: string;
  upstageFileId: string;
  createdAt: number;
}

export interface AgentJobRecord {
  id: string;
  caseId: string;
  raw: AgentJob;
  createdAt: number;
}

export class Up2StageDB extends Dexie {
  cases!: Table<CaseRecord, string>;
  documents!: Table<DocumentRecord, string>;
  parseElements!: Table<ParseElement, string>;
  extracts!: Table<ExtractRecord, string>;
  guidance!: Table<GuidanceRecord, string>;
  documentCache!: Table<DocumentCacheRecord, number>;
  agentJobs!: Table<AgentJobRecord, string>;
  sources!: Table<SourceRecord, string>;
  quickQuestions!: Table<QuickQuestionRecord, string>;
  documentFiles!: Table<DocumentFileRecord, string>;
  userAnswers!: Table<UserAnswerRecord, string>;
  decisions!: Table<DecisionRecord, string>;
  actionItems!: Table<ActionItemRecord, string>;

  constructor(name = "up2stage") {
    super(name);
    this.version(1).stores({
      cases: "&id, status, agentJobId",
      documents: "&id, caseId, [caseId+contentHash], contentHash, upstageFileId",
      parseElements: "&id, [caseId+documentId], caseId, sourceId",
      extracts: "&id, [caseId+documentId], caseId",
      guidance: "&id, caseId",
      documentCache: "++id, &[contentHash+agentVersion]",
      agentJobs: "&id, caseId",
    });
    this.version(2).stores({
      cases: "&id, status, agentJobId",
      documents: "&id, caseId, [caseId+contentHash], contentHash, upstageFileId",
      parseElements: "&id, [caseId+documentId], caseId, sourceId",
      extracts: "&id, [caseId+documentId], caseId",
      guidance: "&id, caseId",
      documentCache: "++id, &[contentHash+agentVersion]",
      agentJobs: "&id, caseId",
      sources: "&sourceId, [caseId+documentId], caseId, documentId, page",
      quickQuestions: "&id, caseId, key",
      documentFiles: "&documentId, caseId",
      userAnswers: "&id, [caseId+questionId], caseId, questionId",
      decisions: "&id, caseId, createdAt",
      actionItems: "&id, caseId, completed",
    });
  }
}

export const db = new Up2StageDB();
