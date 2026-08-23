import { useEffect, useRef, useState } from "react";
import type { DocumentRecord, SourceRecord } from "../../models/canonical";
import { createRenderer } from "../../renderers/registry";
import type { DocumentRendererAdapter } from "../../renderers/types";
import type { SourceRegistry } from "../../features/source-navigation/navigate";
import { navigateToSource, type ViewerHost } from "../../features/source-navigation/navigate";
import { AccessibilityView } from "./AccessibilityView";
import { DocumentSelector } from "./DocumentSelector";
import { ModeTabs } from "./ModeTabs";
import { Outline } from "./Outline";
import { SourceBadge } from "../evidence/SourceBadge";
import { COLORS, RADIUS } from "../../styles/tokens";

type ViewerMode = "structure" | "original" | "accessibility";

export interface ViewerShellProps {
  caseId: string;
  documents: DocumentRecord[];
  sources: SourceRecord[];
  documentBytes: Map<string, ArrayBuffer>;
  sourceRegistry: SourceRegistry;
  initialDocumentId: string | undefined;
  initialSourceId: string | undefined;
}

export function ViewerShell({
  caseId,
  documents,
  sources,
  documentBytes,
  sourceRegistry,
  initialDocumentId,
  initialSourceId,
}: ViewerShellProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    initialDocumentId ?? documents[0]?.id ?? ""
  );
  const [mode, setMode] = useState<ViewerMode>("original");
  const [zoom, setZoom] = useState(1.25);
  const [activePage, setActivePage] = useState(1);
  const [activeSource, setActiveSource] = useState<SourceRecord | null>(null);
  const [selectedOutlineId, setSelectedOutlineId] = useState<string | undefined>(
    initialSourceId
  );
  const workspaceRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DocumentRendererAdapter | null>(null);

  const selectedDocument =
    documents.find((d) => d.id === selectedDocumentId) ?? documents[0];

  const filteredSources = sources.filter(
    (s) => s.documentId === selectedDocument?.id
  );

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
    accessibilityFocus(_nodeId: string | undefined) {
      void _nodeId;
      // Phase 8 outlet slot
    },
  };

  useEffect(() => {
    if (!workspaceRef.current || !selectedDocument) {
      return;
    }

    rendererRef.current?.destroy();
    rendererRef.current = null;

    if (mode !== "original") {
      workspaceRef.current.innerHTML = "";
      return;
    }

    const bytes = documentBytes.get(selectedDocument.id) ?? new ArrayBuffer(0);
    const renderer = createRenderer(selectedDocument, bytes);
    rendererRef.current = renderer;

    void (async () => {
      await renderer.mount(workspaceRef.current as HTMLDivElement);
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

  const activeSourceNumber = activeSource
    ? filteredSources.findIndex((s) => s.sourceId === activeSource.sourceId) + 1
    : undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "224px minmax(0, 1fr) 443px",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: COLORS.textPrimary,
        background: COLORS.bgSurface,
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
          overflow: "auto",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textOnInverse }}>
          문서 목차
        </div>
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
            background: COLORS.bgCanvas,
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
            <ModeTabs mode={mode} onChange={setMode} />
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
                fontSize: 13,
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
                fontSize: 13,
              }}
              aria-label="확대"
            >
              +
            </button>
          </div>
        </header>

        <div
          ref={workspaceRef}
          style={{
            flex: 1,
            overflow: "auto",
            padding: 20,
          }}
        >
          {mode === "structure" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>문서 구조</h2>
              <ul style={{ lineHeight: 1.8 }}>
                {filteredSources.map((source) => (
                  <li key={source.sourceId}>
                    <button
                      type="button"
                      onClick={() =>
                        void navigateToSource(
                          source.sourceId,
                          sourceRegistry,
                          viewer
                        )
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: COLORS.actionPrimary,
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 0,
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
              sources={sources}
              documentId={selectedDocument.id}
              sourceRegistry={sourceRegistry}
              viewer={viewer}
            />
          )}
        </div>
      </section>

      <aside
        style={{
          borderLeft: `1px solid ${COLORS.bgInverseSurface}`,
          padding: 20,
          background: COLORS.bgInverse,
          color: COLORS.textOnInverse,
          overflow: "auto",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: COLORS.textOnInverse }}>
          Up to Stage
        </div>
        <div style={{ fontSize: 12, color: COLORS.textInverseSecondary, marginBottom: 16 }}>
          case {caseId}
        </div>

        {activeSource ? (
          <div
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {activeSourceNumber !== undefined && activeSourceNumber > 0 && (
                <SourceBadge number={activeSourceNumber} />
              )}
              <span style={{ fontSize: 12, color: COLORS.textInverseSecondary }}>
                {selectedDocument?.fileName} · {activeSource.page}쪽
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, color: COLORS.textOnInverse }}>
              &quot;{activeSource.text}&quot;
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
              color: COLORS.textInverseSecondary,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            근거를 눌러 원문의 위치로 이동하세요.
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: COLORS.textOnInverse }}>
          문서별 근거
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredSources.map((source, i) => (
            <button
              key={source.sourceId}
              type="button"
              onClick={() =>
                void navigateToSource(source.sourceId, sourceRegistry, viewer)
              }
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: 10,
                border: "none",
                borderRadius: RADIUS.sm,
                background: COLORS.bgInverseSurface,
                color: COLORS.textOnInverse,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <SourceBadge number={i + 1} />
              <span
                style={{
                  fontSize: 13,
                  color: COLORS.textOnInverse,
                  lineHeight: 1.4,
                }}
              >
                {source.text}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
