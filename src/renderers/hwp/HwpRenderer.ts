import init, { HwpDocument } from "@rhwp/core";
import type { DocumentRecord, SourceRecord } from "../../models/canonical";
import type { DocumentRendererAdapter } from "../types";

const WASM_PATH = "/rhwp_bg.wasm";

type MeasureFn = (font: string, text: string) => number;

export class HwpRenderer implements DocumentRendererAdapter {
  private document: DocumentRecord;
  private bytes: ArrayBuffer;
  private container: HTMLElement | null = null;
  private doc: HwpDocument | null = null;
  private currentPage = 1;
  private totalPages = 1;
  private error = false;

  constructor(document: DocumentRecord, bytes: ArrayBuffer) {
    this.document = document;
    this.bytes = bytes;
  }

  supports(document: DocumentRecord): boolean {
    return document.renderType === "hwp" || document.renderType === "hwpx";
  }

  async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    container.style.overflow = "auto";
    container.style.background = "#f7f7fc";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const measure = (font: string, text: string): number => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return 0;
      ctx.font = font;
      return ctx.measureText(text).width;
    };
    (globalThis as unknown as Record<string, MeasureFn>).measureTextWidth =
      measure;

    try {
      await init({ module_or_path: WASM_PATH });
      this.doc = new HwpDocument(new Uint8Array(this.bytes));
      this.totalPages = this.doc.pageCount();
      await this.goToPage(1);
    } catch {
      this.error = true;
      this.renderFallback();
    }
  }

  goToPage(page: number): Promise<void> {
    if (this.error || !this.doc || !this.container) {
      return Promise.resolve();
    }
    const safePage = Math.max(1, Math.min(page, this.totalPages));
    this.currentPage = safePage;
    const svg = this.doc.renderPageSvg(safePage - 1);
    this.container.innerHTML = `
      <div style="margin:24px 0; box-shadow:0 4px 24px rgba(0,0,0,0.08); background:#fff;">
        ${svg}
      </div>
    `;
    return Promise.resolve();
  }

  async focusSource(source: SourceRecord): Promise<void> {
    await this.goToPage(source.page);
    if (!this.container || !source.polygon) {
      return;
    }
    const wrapper = this.container.firstElementChild as HTMLElement | undefined;
    if (!wrapper) {
      return;
    }
    wrapper.style.position = "relative";

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.pointerEvents = "none";
    overlay.style.background = "rgba(210,255,149,0.42)";

    if (source.polygon && source.polygon.length >= 2) {
      const xs = source.polygon.map((p) => p.x);
      const ys = source.polygon.map((p) => p.y);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      const right = Math.max(...xs);
      const bottom = Math.max(...ys);
      overlay.style.left = `${left * 100}%`;
      overlay.style.top = `${top * 100}%`;
      overlay.style.width = `${(right - left) * 100}%`;
      overlay.style.height = `${(bottom - top) * 100}%`;
    } else {
      overlay.style.inset = "0";
    }

    wrapper.appendChild(overlay);
  }

  setZoom(scale: number): void {
    if (this.container) {
      this.container.style.transform = `scale(${Math.max(
        0.5,
        Math.min(scale, 3)
      )})`;
    }
  }

  destroy(): void {
    if (this.doc) {
      this.doc.free();
      this.doc = null;
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  private renderFallback(): void {
    if (!this.container) {
      return;
    }
    this.container.innerHTML = `
      <div style="padding:40px; color:#0a0d14; text-align:center;">
        <strong>HWP/HWPX 미리보기</strong><br/>
        WASM 파일을 로드할 수 없어 원문을 표시할 수 없습니다.
      </div>
    `;
  }
}
