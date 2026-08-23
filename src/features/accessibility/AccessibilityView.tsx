import { useEffect, useMemo, useRef, useState } from "react";
import type { ParseElement, SourceRecord } from "../../models/canonical";
import { SemanticDocument } from "../../renderers/semantic";
import { buildAccessibleDocument } from "./adapter";

export interface AccessibilityViewProps {
  parseElements: ParseElement[];
  sources: SourceRecord[];
  documentId: string;
  documentLabel: string;
  activeNodeId?: string | undefined;
  focusRequestId?: string | undefined;
  onSourceFocus: (source: SourceRecord) => void;
  onEscape: () => void;
}

function findSemanticElement(container: HTMLElement, nodeId: string): HTMLElement | undefined {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-semantic-node-id]")).find(
    (element) => element.dataset.semanticNodeId === nodeId
  );
}

export function AccessibilityView({
  parseElements,
  sources,
  documentId,
  documentLabel,
  activeNodeId,
  focusRequestId,
  onSourceFocus,
  onEscape
}: AccessibilityViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const model = useMemo(
    () => buildAccessibleDocument(parseElements, sources, documentId),
    [parseElements, sources, documentId]
  );

  useEffect(() => {
    if (!focusRequestId || !containerRef.current) return;
    const element = findSemanticElement(containerRef.current, focusRequestId);
    if (!element) return;
    element.focus({ preventScroll: true });
    if (typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [focusRequestId, model]);

  const selectSource = (sourceId: string, announce: boolean) => {
    const source = model.sourceByNodeId.get(sourceId);
    if (!source) return;
    onSourceFocus(source);
    if (announce) {
      setAnnouncement(`${source.page}쪽 원문 근거를 선택했습니다.`);
    }
  };

  return (
    <div ref={containerRef}>
      <p className="viewer-sr-only" aria-live="polite">
        {announcement}
      </p>
      <SemanticDocument
        nodes={model.nodes}
        documentLabel={documentLabel}
        activeNodeId={activeNodeId}
        onNodeFocus={(sourceId) => selectSource(sourceId, false)}
        onNodeActivate={(sourceId) => selectSource(sourceId, true)}
        onEscape={onEscape}
      />
    </div>
  );
}
