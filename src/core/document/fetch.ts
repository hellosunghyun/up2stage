import { messaging, type AttachmentPayload } from "../messaging/protocol";
import { sha256 } from "../../utils/hash";
import type { DownloadedDocument } from "./types";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function downloadAttachment(
  attachment: AttachmentPayload
): Promise<DownloadedDocument> {
  const { base64, mimeType } = await messaging.downloadAttachment({
    url: attachment.url,
    fileName: attachment.fileName,
    extension: attachment.extension ?? undefined,
  });
  const bytes = base64ToArrayBuffer(base64);
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
