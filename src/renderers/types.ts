import type { DocumentRecord } from "../models/document";
import type { Point, SourceRecord } from "../models/source";

export interface CoordinateTransform {
  sourceToViewport(point: Point): { x: number; y: number };
}

export interface DocumentRendererAdapter {
  supports(document: DocumentRecord): boolean;

  mount(container: HTMLElement): Promise<void>;

  goToPage(page: number): Promise<void>;

  focusSource(source: SourceRecord): Promise<void>;

  setZoom(scale: number): void;

  destroy(): void;
}

export interface RendererFactory {
  create(document: DocumentRecord, bytes: ArrayBuffer): DocumentRendererAdapter;
}
