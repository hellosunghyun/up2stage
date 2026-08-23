import { db, type DocumentCacheRecord } from "./db";
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
  CanonicalAgentResult,
} from "../../models/canonical";

export async function saveAgentJob(
  caseId: string,
  job: AgentJob
): Promise<string> {
  await db.agentJobs.put({
    id: job.id,
    caseId,
    raw: job,
    createdAt: Date.now(),
  });
  return job.id;
}

export async function getAgentJob(
  jobId: string
): Promise<{ raw: AgentJob } | undefined> {
  const record = await db.agentJobs.get(jobId);
  return record ? { raw: record.raw } : undefined;
}

export async function saveCase(record: CaseRecord): Promise<string> {
  await db.cases.put(record);
  return record.id;
}

export async function getCase(id: string): Promise<CaseRecord | undefined> {
  return db.cases.get(id);
}

export async function updateCase(
  id: string,
  patch: Partial<CaseRecord>
): Promise<void> {
  const record = await db.cases.get(id);
  if (!record) return;
  await db.cases.put({ ...record, ...patch, updatedAt: Date.now() });
}

export async function getDocumentsForCase(
  caseId: string
): Promise<DocumentRecord[]> {
  return db.documents.where({ caseId }).toArray();
}

export async function getCaseWithDocuments(
  id: string
): Promise<{ case: CaseRecord; documents: DocumentRecord[] } | undefined> {
  const caseRecord = await db.cases.get(id);
  if (!caseRecord) return undefined;
  const documents = await db.documents.where({ caseId: id }).toArray();
  return { case: caseRecord, documents };
}

export async function saveDocuments(
  records: DocumentRecord[]
): Promise<void> {
  await db.documents.bulkPut(records);
}

export async function saveParseElements(records: ParseElement[]): Promise<void> {
  if (records.length === 0) return;
  await db.parseElements.bulkPut(records);
}

export async function saveExtracts(records: ExtractRecord[]): Promise<void> {
  if (records.length === 0) return;
  await db.extracts.bulkPut(records);
}

export async function saveGuidance(record: GuidanceRecord | null): Promise<void> {
  if (!record) return;
  await db.guidance.put(record);
}

export async function saveSources(records: SourceRecord[]): Promise<void> {
  if (records.length === 0) return;
  await db.sources.bulkPut(records);
}

export async function getSourcesForCase(caseId: string): Promise<SourceRecord[]> {
  return db.sources.where({ caseId }).toArray();
}

export async function getSourcesForDocument(
  caseId: string,
  documentId: string
): Promise<SourceRecord[]> {
  return db.sources.where({ caseId, documentId }).toArray();
}

export async function getSource(sourceId: string): Promise<SourceRecord | undefined> {
  return db.sources.get(sourceId);
}

export async function saveQuickQuestions(
  records: QuickQuestionRecord[]
): Promise<void> {
  if (records.length === 0) return;
  await db.quickQuestions.bulkPut(records);
}

export async function getQuickQuestionsForCase(
  caseId: string
): Promise<QuickQuestionRecord[]> {
  return db.quickQuestions.where({ caseId }).toArray();
}

export async function saveDocumentFile(record: DocumentFileRecord): Promise<void> {
  await db.documentFiles.put(record);
}

export async function getDocumentFilesForCase(
  caseId: string
): Promise<DocumentFileRecord[]> {
  return db.documentFiles.where({ caseId }).toArray();
}

export async function getCanonicalAgentResult(
  caseId: string
): Promise<CanonicalAgentResult | undefined> {
  const caseRecord = await db.cases.get(caseId);
  if (!caseRecord?.agentJobId) return undefined;

  const [documents, parseElements, sources, extracts, guidance, quickQuestions] =
    await Promise.all([
      db.documents.where({ caseId }).toArray(),
      db.parseElements.where({ caseId }).toArray(),
      db.sources.where({ caseId }).toArray(),
      db.extracts.where({ caseId }).toArray(),
      db.guidance.where({ caseId }).first(),
      db.quickQuestions.where({ caseId }).toArray(),
    ]);

  return {
    caseId,
    agentJobId: caseRecord.agentJobId,
    status: caseRecord.status === "failed" ? "failed" : "completed",
    completedAt: caseRecord.updatedAt,
    documents,
    parseElements,
    sources,
    extracts,
    guidance: guidance ?? null,
    quickQuestions,
  };
}

export async function getOrCreateCachedFileId(
  contentHash: string,
  agentVersion: string,
  create: () => Promise<string>
): Promise<string> {
  const cached = await db.documentCache
    .where({ contentHash, agentVersion })
    .first();
  if (cached?.upstageFileId) return cached.upstageFileId;

  const upstageFileId = await create();
  const record: DocumentCacheRecord = {
    contentHash,
    agentVersion,
    upstageFileId,
    createdAt: Date.now(),
  };
  await db.documentCache.put(record);
  return upstageFileId;
}

export async function getCachedFileId(
  contentHash: string,
  agentVersion: string
): Promise<string | undefined> {
  const cached = await db.documentCache
    .where({ contentHash, agentVersion })
    .first();
  return cached?.upstageFileId;
}
