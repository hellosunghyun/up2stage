import type { DocumentRecord } from "../../models/document";
import type { SourceRecord } from "../../models/source";
import type { DocumentRendererAdapter } from "../types";

export class UnsupportedRenderer implements DocumentRendererAdapter {
  private document: DocumentRecord;

  constructor(document: DocumentRecord) {
    this.document = document;
  }

  supports(document: DocumentRecord): boolean {
    return document.renderType === "unsupported";
  }

  mount(container: HTMLElement): Promise<void> {
    container.innerHTML = `
      <div style="padding:40px; text-align:center; color:#0a0d14;">
        <strong>지원하지 않는 형식</strong><br/>
        ${this.document.fileName} (${this.document.extension})는
        현재 미리보기를 지원하지 않습니다.
      </div>
    `;
    return Promise.resolve();
  }

  goToPage(_page: number): Promise<void> {
    void _page;
    return Promise.resolve();
  }

  focusSource(_source: SourceRecord): Promise<void> {
    void _source;
    return Promise.resolve();
  }

  setZoom(_scale: number): void {
    void _scale;
  }

  destroy(): void {
    // nothing
  }
}
