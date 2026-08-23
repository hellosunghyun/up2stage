import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type { DocumentRecord, SourceRecord } from "../../models/canonical";
import type { DocumentRendererAdapter } from "../types";

const pdfWorkerUrl = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export class PdfRenderer implements DocumentRendererAdapter {
  private container: HTMLElement | null = null;
  private pageContainer: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private loadingTask: PDFDocumentLoadingTask | null = null;
  private pdf: PDFDocumentProxy | null = null;
  private currentPage = 1;
  private scale = 1.25;
  private document: DocumentRecord;
  private bytes: ArrayBuffer;

  constructor(document: DocumentRecord, bytes: ArrayBuffer) {
    this.document = document;
    this.bytes = bytes;
  }

  supports(document: DocumentRecord): boolean {
    return document.renderType === "pdf";
  }

  async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    container.style.overflow = "auto";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.background = "#f7f7fc";

    this.pageContainer = document.createElement("div");
    this.pageContainer.style.position = "relative";
    this.pageContainer.style.margin = "24px 0";
    this.pageContainer.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";

    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.inset = "0";
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.zIndex = "2";

    this.pageContainer.appendChild(this.overlay);
    container.appendChild(this.pageContainer);

    try {
      this.loadingTask = pdfjs.getDocument({ data: new Uint8Array(this.bytes) });
      this.pdf = await this.loadingTask.promise;
      await this.goToPage(this.currentPage);
    } catch {
      if (this.pageContainer) {
        this.pageContainer.textContent = "PDF를 불러올 수 없습니다.";
      }
    }
  }

  async goToPage(page: number): Promise<void> {
    if (!this.pdf || !this.pageContainer) {
      return;
    }
    const safePage = Math.max(1, Math.min(page, this.pdf.numPages));
    this.currentPage = safePage;
    const pdfPage = await this.pdf.getPage(safePage);
    const viewport = pdfPage.getViewport({ scale: this.scale });

    this.pageContainer.innerHTML = "";
    this.pageContainer.style.width = `${viewport.width}px`;
    this.pageContainer.style.height = `${viewport.height}px`;

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.display = "block";

    const context = canvas.getContext("2d");
    if (context) {
      await pdfPage
        .render({
          canvasContext: context,
          canvas,
          viewport,
        })
        .promise;
    }

    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.inset = "0";
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.zIndex = "2";

    this.pageContainer.appendChild(canvas);
    this.pageContainer.appendChild(this.overlay);
  }

  async focusSource(source: SourceRecord): Promise<void> {
    await this.goToPage(source.page);
    if (!this.overlay || !source.polygon) {
      return;
    }
    if (!this.pageContainer) {
      return;
    }
    const points = source.polygon;
    if (points.length < 3) {
      return;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.inset = "0";
    const renderedWidth = this.pageContainer.clientWidth;
    const renderedHeight = this.pageContainer.clientHeight;
    svg.setAttribute("width", String(renderedWidth));
    svg.setAttribute("height", String(renderedHeight));

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    const pointsAttr = points
      .map((p) => `${p.x * renderedWidth},${p.y * renderedHeight}`)
      .join(" ");
    polygon.setAttribute("points", pointsAttr);
    polygon.setAttribute("fill", "rgba(210,255,149,0.42)");
    polygon.setAttribute("stroke", "#d2ff95");
    polygon.setAttribute("stroke-width", "1");

    svg.appendChild(polygon);
    this.overlay.appendChild(svg);
  }

  setZoom(scale: number): void {
    this.scale = Math.max(0.5, Math.min(scale, 3));
    void this.goToPage(this.currentPage);
  }

  destroy(): void {
    if (this.loadingTask) {
      void this.loadingTask.destroy();
      this.loadingTask = null;
    }
    this.pdf = null;
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}
