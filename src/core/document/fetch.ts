import type { AttachmentPayload } from "../messaging/protocol";
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
  return {
    url: attachment.url,
    fileName: attachment.fileName,
    extension: attachment.extension ?? "",
    bytes,
  };
}
