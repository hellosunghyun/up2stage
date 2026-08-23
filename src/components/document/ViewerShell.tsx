import { useEffect, useRef, useState } from "react";
import type { DocumentRecord, ParseElement, SourceRecord } from "../../models/canonical";
import { createRenderer } from "../../renderers/registry";
import type { DocumentRendererAdapter } from "../../renderers/types";
import type { SourceRegistry } from "../../features/source-navigation/navigate";
import { navigateToSource, type ViewerHost } from "../../features/source-navigation/navigate";
import { AccessibilityView } from "../../features/accessibility/AccessibilityView";
import { DocumentSelector } from "./DocumentSelector";
import { ModeTabs } from "./ModeTabs";
import { Outline } from "./Outline";
import { COLORS, RADIUS } from "../../styles/tokens";
import { ViewerGuidancePanel, type ViewerGuidanceData } from "./ViewerGuidancePanel";

type ViewerMode = "structure" | "original" | "accessibility";

export interface ViewerShellProps {
  caseId: string;
  documents: DocumentRecord[];
  sources: SourceRecord[];
  parseElements: ParseElement[];
  documentBytes: Map<string, ArrayBuffer>;
  sourceRegistry: SourceRegistry;
  initialDocumentId: string | undefined;
  initialSourceId: string | undefined;
  guidance?: ViewerGuidanceData | undefined;
}

export function ViewerShell({
  caseId,
  documents,
  sources,
  parseElements,
  documentBytes,
  sourceRegistry,
  initialDocumentId,
  initialSourceId,
  guidance
}: ViewerShellProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    initialDocumentId ?? documents[0]?.id ?? ""
  );
  const [mode, setMode] = useState<ViewerMode>("original");
  const [zoom, setZoom] = useState(1.25);
  const [activePage, setActivePage] = useState(1);
  const [activeSource, setActiveSource] = useState<SourceRecord | null>(null);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | undefined>(initialSourceId);
  const [accessibilityFocusId, setAccessibilityFocusId] = useState<string | undefined>();
  const [lastAccessibilityFocusId, setLastAccessibilityFocusId] = useState<string | undefined>();
  const rendererContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DocumentRendererAdapter | null>(null);
  const accessibilityTabRef = useRef<HTMLButtonElement>(null);

  const selectedDocument = documents.find((d) => d.id === selectedDocumentId) ?? documents[0];

  const filteredSources = sources.filter((s) => s.documentId === selectedDocument?.id);

  const viewer: ViewerHost = {
    selectDocument(documentId: string) {
      setSelectedDocumentId(documentId);
    },
    async goToPage(page: number) {
      setActivePage(page);
      await rendererRef.current?.goToPage(page);
    },
    async focusSource(source: SourceRecord) {
      setActiveSource(source);
      await rendererRef.current?.focusSource(source);
    },
    outlineSelect(nodeId: string) {
      setSelectedOutlineId(nodeId);
    },
    accessibilityFocus(nodeId: string | undefined) {
      if (!nodeId) return;
      setAccessibilityFocusId(nodeId);
      setLastAccessibilityFocusId(nodeId);
      setMode("accessibility");
    }
  };

  useEffect(() => {
    if (!rendererContainerRef.current || !selectedDocument || mode !== "original") {
      return;
    }

    rendererRef.current?.destroy();
    rendererRef.current = null;

    const bytes = documentBytes.get(selectedDocument.id) ?? new ArrayBuffer(0);
    const renderer = createRenderer(selectedDocument, bytes);
    rendererRef.current = renderer;

    void (async () => {
      await renderer.mount(rendererContainerRef.current as HTMLDivElement);
      await renderer.goToPage(activePage);
      if (activeSource?.documentId === selectedDocument.id) {
        await renderer.focusSource(activeSource);
      }
    })();

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [selectedDocument, mode, documentBytes, activePage, activeSource]);

  useEffect(() => {
    if (initialSourceId) {
      void navigateToSource(initialSourceId, sourceRegistry, viewer);
    }
  }, []);

  const handleZoom = (delta: number) => {
    const next = Math.max(0.5, Math.min(zoom + delta, 3));
    setZoom(next);
    rendererRef.current?.setZoom(next);
  };

  const handleSemanticSourceFocus = (source: SourceRecord) => {
    setActiveSource(source);
    setActivePage(source.page);
    setSelectedOutlineId(source.semanticNodeId ?? source.sourceId);
    setLastAccessibilityFocusId(source.semanticNodeId ?? source.sourceId);
  };

  const handleModeChange = (nextMode: ViewerMode) => {
    setMode(nextMode);
    if (nextMode === "accessibility" && lastAccessibilityFocusId) {
      setAccessibilityFocusId(lastAccessibilityFocusId);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "224px minmax(0, 1fr) 443px",
        height: "100vh",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: COLORS.textPrimary,
        background: COLORS.bgSurface
      }}
    >
      <aside
        style={{
          borderRight: `1px solid ${COLORS.bgInverseSurface}`,
          padding: 20,
          background: COLORS.bgInverse,
          color: COLORS.textOnInverse,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflow: "auto"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textOnInverse }}>문서 목차</div>
        {selectedDocument && (
          <div style={{ fontSize: 12, color: COLORS.textInverseSecondary }}>
            {selectedDocument.fileName} · {activePage}
          </div>
        )}
        {selectedDocument && (
          <Outline
            sources={sources}
            documentId={selectedDocument.id}
            selectedSourceId={selectedOutlineId}
            sourceRegistry={sourceRegistry}
            viewer={viewer}
          />
        )}
      </aside>

      <section style={{ display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.bgCanvas
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <DocumentSelector
              documents={documents}
              selectedId={selectedDocument?.id ?? ""}
              onSelect={(id) => {
                setSelectedDocumentId(id);
                setActivePage(1);
                setActiveSource(null);
              }}
            />
            <ModeTabs
              mode={mode}
              onChange={handleModeChange}
              accessibilityTabRef={accessibilityTabRef}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleZoom(-0.25)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.sm,
                background: COLORS.bgCanvas,
                cursor: "pointer",
                fontSize: 13
              }}
              aria-label="축소"
            >
              −
            </button>
            <span style={{ fontSize: 13, minWidth: 48, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.25)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.sm,
                background: COLORS.bgCanvas,
                cursor: "pointer",
                fontSize: 13
              }}
              aria-label="확대"
            >
              +
            </button>
          </div>
        </header>

        <div
          id="viewer-workspace-panel"
          role="tabpanel"
          aria-labelledby={`viewer-mode-${mode}`}
          tabIndex={-1}
          style={{
            flex: 1,
            overflow: "auto",
            padding: 20
          }}
        >
          {mode === "original" && (
            <div ref={rendererContainerRef} style={{ minHeight: "100%" }} />
          )}
          {mode === "structure" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>문서 구조</h2>
              <ul style={{ lineHeight: 1.8 }}>
                {filteredSources.map((source) => (
                  <li key={source.sourceId}>
                    <button
                      type="button"
                      onClick={() => void navigateToSource(source.sourceId, sourceRegistry, viewer)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: COLORS.actionPrimary,
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 0
                      }}
                    >
                      {source.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mode === "accessibility" && selectedDocument && (
            <AccessibilityView
              parseElements={parseElements}
              sources={sources}
              documentId={selectedDocument.id}
              documentLabel={selectedDocument.fileName}
              activeNodeId={lastAccessibilityFocusId}
              focusRequestId={accessibilityFocusId}
              onSourceFocus={handleSemanticSourceFocus}
              onEscape={() => accessibilityTabRef.current?.focus()}
            />
          )}
        </div>
      </section>

      <ViewerGuidancePanel
        caseId={caseId}
        guidance={guidance}
        activeSource={activeSource}
        selectedDocument={selectedDocument}
        sources={sources}
        sourceRegistry={sourceRegistry}
        viewer={viewer}
      />
    </div>
  );
}
