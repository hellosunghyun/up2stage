import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ViewerShell } from "../../src/components/document/ViewerShell";
import { SourceRegistry } from "../../src/core/evidence";
import {
  getDocumentFilesForCase,
  getDocumentsForCase,
  getSourcesForCase,
  getCanonicalAgentResult
} from "../../src/core/storage/repositories";
import type { DocumentRecord, SourceRecord } from "../../src/models/canonical";
import { buildGuidanceViewData } from "../../src/features/guidance/adapter";
import type { ViewerGuidanceData } from "../../src/components/document/ViewerGuidancePanel";

interface ViewerData {
  documents: DocumentRecord[];
  sources: SourceRecord[];
  bytes: Map<string, ArrayBuffer>;
  registry: SourceRegistry;
  guidance?: ViewerGuidanceData;
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
      getDocumentFilesForCase(caseId),
      getCanonicalAgentResult(caseId)
    ])
      .then(([documents, sources, files, agentResult]) => {
        if (documents.length === 0) {
          throw new Error("저장된 문서를 찾지 못했어요.");
        }
        const guidanceData = agentResult ? buildGuidanceViewData(agentResult) : undefined;
        const guidance: ViewerGuidanceData | undefined = guidanceData
          ? {
              overview: guidanceData.guidance.overview,
              topRequirements: guidanceData.guidance.topRequirements,
              nearestDeadline: guidanceData.guidance.nearestDeadline,
              requiredSubmissions: guidanceData.guidance.requiredSubmissions,
              nextActions: guidanceData.guidance.nextActions,
              sourceGroups: {
                topRequirements: guidanceData.sourceGroups.topRequirements,
                nearestDeadline: guidanceData.sourceGroups.nearestDeadline,
                requiredSubmissions: guidanceData.sourceGroups.requiredSubmissions
              },
              sourceLabels: guidanceData.sourceLabels
            }
          : undefined;
        setData({
          documents,
          sources,
          bytes: new Map(files.map((file) => [file.documentId, file.bytes])),
          registry: new SourceRegistry().register(sources),
          ...(guidance ? { guidance } : {})
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
      caseId={caseId}
      documents={data.documents}
      sources={data.sources}
      documentBytes={data.bytes}
      sourceRegistry={data.registry}
      initialDocumentId={documentId}
      initialSourceId={sourceId}
      {...(data.guidance ? { guidance: data.guidance } : {})}
    />
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
