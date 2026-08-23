import { useVirtualizer } from "@tanstack/react-virtual";
import * as XLSX from "xlsx";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { DocumentRecord } from "../../models/document";
import type { SourceRecord } from "../../models/source";
import type { DocumentRendererAdapter } from "../types";

interface GridProps {
  workbook: XLSX.WorkBook;
  activeSheet: number;
  focusText: string;
  zoom: number;
  onCellClick: (row: number, col: number) => void;
}

const COL_WIDTH = 120;
const ROW_HEIGHT = 28;

function XlsxGrid({ workbook, activeSheet, focusText, zoom, onCellClick }: GridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sheetIndex = activeSheet ?? 0;
  const sheet = workbook.SheetNames[sheetIndex] ?? workbook.SheetNames[0];
  if (!sheet) {
    return <div style={{ padding: 40 }}>시트가 없습니다.</div>;
  }
  const worksheet = workbook.Sheets[sheet]!;
  const json = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "" });
  const rowCount = json.length;
  const colCount = Math.max(1, ...json.map((r) => r.length));

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const colVirtualizer = useVirtualizer({
    horizontal: true,
    count: colCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => COL_WIDTH,
    overscan: 5,
  });

  useEffect(() => {
    if (focusText.length === 0 || !parentRef.current) return;
    for (let i = 0; i < rowCount; i++) {
      const row = json[i];
      if (!row) continue;
      for (let j = 0; j < row.length; j++) {
        const value = row[j] ?? "";
        if (value.includes(focusText)) {
          rowVirtualizer.scrollToIndex(i, { align: "center" });
          colVirtualizer.scrollToIndex(j, { align: "center" });
          return;
        }
      }
    }
  }, [focusText, json, rowCount, rowVirtualizer, colVirtualizer]);

  return (
    <div
      ref={parentRef}
      style={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        background: "#fff",
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${colVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = json[virtualRow.index];
          return colVirtualizer.getVirtualItems().map((virtualCol) => {
            const value = row?.[virtualCol.index] ?? "";
            const focused =
              focusText.length > 0 && value.includes(focusText);
            return (
              <div
                key={`${virtualRow.index}-${virtualCol.index}`}
                role="cell"
                onClick={() => onCellClick(virtualRow.index, virtualCol.index)}
                style={{
                  position: "absolute",
                  top: `${virtualRow.start}px`,
                  left: `${virtualCol.start}px`,
                  width: `${virtualCol.size}px`,
                  height: `${virtualRow.size}px`,
                  border: "1px solid #e5e7eb",
                  padding: "4px 8px",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  background: focused ? "rgba(210,255,149,0.42)" : "#fff",
                }}
              >
                {value}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

export class XlsxRenderer implements DocumentRendererAdapter {
  private document: DocumentRecord;
  private bytes: ArrayBuffer;
  private container: HTMLElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private workbook: XLSX.WorkBook | null = null;
  private activeSheet = 0;
  private zoom = 1;
  private focusText = "";

  constructor(document: DocumentRecord, bytes: ArrayBuffer) {
    this.document = document;
    this.bytes = bytes;
  }

  supports(document: DocumentRecord): boolean {
    return document.renderType === "xlsx";
  }

  mount(container: HTMLElement): Promise<void> {
    this.container = container;
    container.style.overflow = "hidden";
    container.style.background = "#f7f7fc";

    this.root = createRoot(container);
    try {
      this.workbook = XLSX.read(new Uint8Array(this.bytes), { type: "array" });
      this.render();
    } catch {
      this.root.render(
        <div style={{ padding: 40, textAlign: "center" }}>
          XLSX 파일을 불러올 수 없습니다.
        </div>
      );
    }
    return Promise.resolve();
  }

  goToPage(page: number): Promise<void> {
    if (!this.workbook) return Promise.resolve();
    const safe = Math.max(0, Math.min(page - 1, this.workbook.SheetNames.length - 1));
    this.activeSheet = safe;
    this.render();
    return Promise.resolve();
  }

  async focusSource(source: SourceRecord): Promise<void> {
    this.focusText = source.text;
    await this.goToPage(source.page);
  }

  setZoom(scale: number): void {
    this.zoom = Math.max(0.5, Math.min(scale, 3));
    this.render();
  }

  destroy(): void {
    this.focusText = "";
    this.root?.unmount();
    this.root = null;
    this.container = null;
  }

  private render(): void {
    if (!this.workbook || !this.root) return;
    this.root.render(
      <XlsxGrid
        workbook={this.workbook}
        activeSheet={this.activeSheet}
        focusText={this.focusText}
        zoom={this.zoom}
        onCellClick={() => undefined}
      />
    );
  }
}
