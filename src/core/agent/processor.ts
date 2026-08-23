import { downloadAttachment } from "../document/fetch";
import type { AttachmentPayload } from "../messaging/protocol";
import { getApiKey } from "../storage/apiKey";
import {
  getCase,
  getCaseWithDocuments,
  getOrCreateCachedFileId,
  saveCase,
  saveDocuments,
  saveExtracts,
  saveGuidance,
  saveParseElements,
  updateCase,
} from "../storage/repositories";
import { AGENT_VERSION } from "./config";
import { createAgentJob, retrieveAgentJob, uploadFile } from "./api";
import { adaptAgentJob } from "./adapter";
import type { AgentJob } from "./types";
import { generateId } from "../../utils/id";
import type { CaseRecord, DocumentRecord } from "../../models/canonical";

export interface ProcessingProgress {
  caseId: string;
  overall: "idle" | "preparing" | "submitted" | "processing" | "normalizing" | "complete" | "failed";
  documents: DocumentRecord[];
  message: string;
}

function getRenderType(extension: string): DocumentRecord["renderType"] {
  const e = extension.toLowerCase();
  if (e === "pdf") return "pdf";
  if (e === "hwp") return "hwp";
  if (e === "hwpx") return "hwpx";
  if (e === "xlsx") return "xlsx";
  return "unsupported";
}

function buildInitialDocument(
  caseId: string,
  attachment: AttachmentPayload
): DocumentRecord {
  return {
    id: generateId(),
    caseId,
    originalUrl: attachment.url,
    fileName: attachment.fileName,
    extension: (attachment.extension ?? "").toLowerCase(),
    renderType: getRenderType(attachment.extension ?? ""),
    contentHash: "",
    processingStatus: "pending",
    createdAt: Date.now(),
  };
}

export async function createCase(
  url: string,
  title: string,
  selectedAttachmentIds: string[]
): Promise<CaseRecord> {
  const normalized = url.split("#")[0] ?? url;
  const caseRecord: CaseRecord = {
    id: generateId(),
    sourcePage: { url, title, normalizedUrl: normalized },
    status: "discovered",
    selectedDocumentIds: selectedAttachmentIds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveCase(caseRecord);
  return caseRecord;
}

export async function prepareAndStart(
  caseRecord: CaseRecord,
  attachments: AttachmentPayload[],
  onProgress: (p: ProcessingProgress) => void
): Promise<void> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 없어요. 설정에서 입력해주세요.");
  }

  const documents = attachments.map((a) => buildInitialDocument(caseRecord.id, a));
  await saveDocuments(documents);

  onProgress({
    caseId: caseRecord.id,
    overall: "preparing",
    documents,
    message: "문서를 준비하고 있어요.",
  });

  const updated: DocumentRecord[] = [];

  for (const doc of documents) {
    const attachment = attachments.find((a) => a.id === doc.originalUrl);
    if (!attachment) {
      doc.processingStatus = "download_failed";
      doc.processingError = "선택한 첨부 파일을 찾을 수 없어요.";
      updated.push(doc);
      continue;
    }

    doc.processingStatus = "downloading";
    onProgress({ caseId: caseRecord.id, overall: "preparing", documents: [...updated, doc], message: `${doc.fileName} 다운로드 중` });

    try {
      const downloaded = await downloadAttachment(attachment);
      doc.contentHash = downloaded.contentHash;
      doc.size = downloaded.bytes.byteLength;

      doc.processingStatus = "uploading";
      onProgress({ caseId: caseRecord.id, overall: "preparing", documents: [...updated, doc], message: `${doc.fileName} 업로드 중` });

      const upstageFileId = await getOrCreateCachedFileId(
        doc.contentHash,
        AGENT_VERSION,
        async () => {
          const file = await uploadFile(apiKey, doc.fileName, downloaded.bytes);
          return file.id;
        }
      );

      doc.upstageFileId = upstageFileId;
      doc.processingStatus = "uploaded";
    } catch (e) {
      doc.processingStatus = doc.processingStatus === "downloading" ? "download_failed" : "upload_failed";
      doc.processingError = e instanceof Error ? e.message : "알 수 없는 오류";
    }
    updated.push(doc);
  }

  await saveDocuments(updated);

  const ready = updated.filter((d) => d.upstageFileId);
  if (ready.length === 0) {
    await updateCase(caseRecord.id, { status: "failed", updatedAt: Date.now() });
    onProgress({ caseId: caseRecord.id, overall: "failed", documents: updated, message: "모든 문서를 업로드하지 못했어요." });
    return;
  }

  const fileIds = ready.map((d) => d.upstageFileId!);
  const job = await createAgentJob({ apiKey, fileIds });
  await updateCase(caseRecord.id, { status: "processing", agentJobId: job.id, agentStatus: job.status, updatedAt: Date.now() });

  onProgress({
    caseId: caseRecord.id,
    overall: job.status === "queued" ? "submitted" : "processing",
    documents: updated,
    message: "문서 분석을 시작했어요.",
  });

  await pollAndStore(apiKey, caseRecord.id, updated, onProgress);
}

export async function resumeProcessing(
  caseId: string,
  onProgress: (p: ProcessingProgress) => void
): Promise<void> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 없어요.");
  }

  const pair = await getCaseWithDocuments(caseId);
  if (!pair) return;
  if (pair.case.status !== "processing" || !pair.case.agentJobId) return;

  onProgress({
    caseId,
    overall: "processing",
    documents: pair.documents,
    message: "진행 중인 분석을 이어 받고 있어요.",
  });

  await pollAndStore(apiKey, caseId, pair.documents, onProgress);
}

async function pollAndStore(
  apiKey: string,
  caseId: string,
  documents: DocumentRecord[],
  onProgress: (p: ProcessingProgress) => void
): Promise<void> {
  const caseRecord = await getCase(caseId);
  if (!caseRecord?.agentJobId) return;

  let job: AgentJob;
  do {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    job = await retrieveAgentJob(apiKey, caseRecord.agentJobId);
    onProgress({
      caseId,
      overall: toOverall(job.status),
      documents,
      message: getStatusMessage(job),
    });
  } while (job.status === "queued" || job.status === "in_progress");

  if (job.status === "failed") {
    await updateCase(caseId, {
      status: "failed",
      agentStatus: "failed",
      updatedAt: Date.now(),
    });
    onProgress({ caseId, overall: "failed", documents, message: "분석에 실패했어요." });
    return;
  }

  const result = adaptAgentJob(job, caseRecord, documents);
  await Promise.all([
    saveDocuments(result.documents),
    saveParseElements(result.parseElements),
    saveExtracts(result.extracts),
    saveGuidance(result.guidance),
    updateCase(caseId, {
      status: "processed",
      agentStatus: "completed",
      updatedAt: Date.now(),
    }),
  ]);

  onProgress({
    caseId,
    overall: "complete",
    documents: result.documents,
    message: "분석이 완료되었어요.",
  });
}

function toOverall(
  status: AgentJob["status"]
): ProcessingProgress["overall"] {
  switch (status) {
    case "queued":
      return "submitted";
    case "in_progress":
      return "processing";
    case "completed":
      return "complete";
    case "failed":
      return "failed";
    default:
      return "processing";
  }
}

function getStatusMessage(job: AgentJob): string {
  if (job.status === "queued") return "대기 중이에요.";
  if (job.status === "failed") return "분석에 실패했어요.";
  const current = job.output[job.output.length - 1];
  if (!current) return "처리 중이에요.";
  if (current.model === "step_1_parse") return "문서 구조를 읽는 중이에요.";
  if (current.model === "step_2_classify") return "문서 역할을 분류하는 중이에요.";
  if (current.model.startsWith("Information Extract")) return "주요 정보를 정리하는 중이에요.";
  if (current.model.startsWith("Instruct")) return "초기 안내를 만드는 중이에요.";
  return "처리 중이에요.";
}
