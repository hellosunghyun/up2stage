import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case") ?? "";
  const documentId = params.get("document") ?? "";
  const sourceId = params.get("source") ?? "";

  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 20, margin: 0 }}>up to stage 문서 보기</h1>
      <p style={{ fontSize: 14, color: "#666" }}>
        Viewer extension page shell입니다.
      </p>
      <pre style={{ fontSize: 12, background: "#f4f4f9", padding: 16 }}>
        {JSON.stringify({ caseId, documentId, sourceId }, null, 2)}
      </pre>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
