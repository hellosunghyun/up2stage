export interface DownloadedDocument {
  url: string;
  fileName: string;
  mimeType?: string | undefined;
  extension: string;
  bytes: ArrayBuffer;
  contentHash: string;
}
