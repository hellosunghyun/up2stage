import type { AttachmentPayload } from "../messaging/protocol";
import { sha256 } from "../../utils/hash";
import type { DownloadedDocument } from "./types";

function sanitizeMimeType(value: string | null): string {
  if (!value) return "application/octet-stream";
  return value.split(";")[0]!.trim();
}

async function downloadDocument(url: string): Promise<{ bytes: ArrayBuffer; mimeType: string }> {
  const res = await fetch(url, { method: "GET", credentials: "omit" });
  if (!res.ok) {
    throw new Error(`download failed: ${res.status} ${res.statusText}`);
  }
  const bytes = await res.arrayBuffer();
  const mimeType = sanitizeMimeType(res.headers.get("content-type"));
  return { bytes, mimeType };
}

export async function downloadAttachment(
  attachment: AttachmentPayload
): Promise<DownloadedDocument> {
  const { bytes, mimeType } = await downloadDocument(attachment.url);
  const contentHash = await sha256(bytes);
  return {
    url: attachment.url,
    fileName: attachment.fileName,
    mimeType,
    extension: attachment.extension ?? "",
    bytes,
    contentHash,
  };
}
