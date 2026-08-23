import { createRoot } from "react-dom/client";
import { ViewerShell } from "../../src/components/document/ViewerShell";
import {
  fixtureBytes,
  fixtureDocuments,
  fixtureSourceRegistry,
  fixtureSources,
} from "../../src/features/source-navigation/fixture";

function App() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case") ?? "case_demo";
  const documentId = params.get("document") ?? undefined;
  const sourceId = params.get("source") ?? undefined;

  return (
    <ViewerShell
      caseId={caseId}
      documents={fixtureDocuments}
      sources={fixtureSources}
      documentBytes={fixtureBytes}
      sourceRegistry={fixtureSourceRegistry}
      initialDocumentId={documentId}
      initialSourceId={sourceId}
    />
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
