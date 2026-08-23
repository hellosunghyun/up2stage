import type { AttachmentPayload } from "../messaging/protocol";
import { sha256 } from "../../utils/hash";
import type { DownloadedDocument } from "./types";

export async function downloadDocument(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { method: "GET", credentials: "omit" });
  if (!res.ok) {
    throw new Error(`download failed: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}

export async function downloadAttachment(
  attachment: AttachmentPayload
): Promise<DownloadedDocument> {
  const bytes = await downloadDocument(attachment.url);
  const contentHash = await sha256(bytes);
  return {
    url: attachment.url,
    fileName: attachment.fileName,
    extension: attachment.extension ?? "",
    bytes,
    contentHash,
  };
}
