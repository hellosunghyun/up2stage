import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ViewerShell } from "../../src/components/document/ViewerShell";
import { SourceRegistry } from "../../src/core/evidence";
import {
  getDocumentFilesForCase,
  getDocumentsForCase,
  getSourcesForCase
} from "../../src/core/storage/repositories";
import type { DocumentRecord, SourceRecord } from "../../src/models/canonical";

interface ViewerData {
  documents: DocumentRecord[];
  sources: SourceRecord[];
  bytes: Map<string, ArrayBuffer>;
  registry: SourceRegistry;
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case");
  const documentId = params.get("document") ?? undefined;
  const sourceId = params.get("source") ?? undefined;
  const [data, setData] = useState<ViewerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setError("Case ID가 없어 문서를 열 수 없어요.");
      return;
    }

    void Promise.all([
      getDocumentsForCase(caseId),
      getSourcesForCase(caseId),
      getDocumentFilesForCase(caseId)
    ])
      .then(([documents, sources, files]) => {
        if (documents.length === 0) {
          throw new Error("저장된 문서를 찾지 못했어요.");
        }
        setData({
          documents,
          sources,
          bytes: new Map(files.map((file) => [file.documentId, file.bytes])),
          registry: new SourceRegistry().register(sources)
        });
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Viewer 데이터를 불러오지 못했어요.");
      });
  }, [caseId]);

  if (error) {
    return <p style={{ padding: 24 }}>{error}</p>;
  }
  if (!caseId || !data) {
    return <p style={{ padding: 24 }}>원문을 불러오고 있어요.</p>;
  }

  return (
    <ViewerShell
      documents={data.documents}
      sources={data.sources}
      documentBytes={data.bytes}
      sourceRegistry={data.registry}
      initialDocumentId={documentId}
      initialSourceId={sourceId}
    />
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
