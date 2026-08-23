import type { DocumentRecord } from "../models/document";
import { HwpRenderer } from "./hwp/HwpRenderer";
import { PdfRenderer } from "./pdf/PdfRenderer";
import type { DocumentRendererAdapter } from "./types";
import { UnsupportedRenderer } from "./unsupported/UnsupportedRenderer";
import { XlsxRenderer } from "./xlsx/XlsxRenderer";

export function createRenderer(
  document: DocumentRecord,
  bytes: ArrayBuffer
): DocumentRendererAdapter {
  switch (document.renderType) {
    case "pdf":
      return new PdfRenderer(document, bytes);
    case "hwp":
    case "hwpx":
      return new HwpRenderer(document, bytes);
    case "xlsx":
      return new XlsxRenderer(document, bytes);
    case "unsupported":
    default:
      return new UnsupportedRenderer(document);
  }
}
