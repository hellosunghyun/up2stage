import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case") ?? "";
  const documentId = params.get("document") ?? "";
  const sourceId = params.get("source") ?? "";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "224px minmax(0, 1fr) 443px",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#0a0d14",
        background: "#f7f7fc",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: 20,
          background: "#ffffff",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14 }}>문서 목차</div>
        <pre style={{ fontSize: 11, marginTop: 16, whiteSpace: "pre-wrap" }}>
          {JSON.stringify({ caseId, documentId, sourceId }, null, 2)}
        </pre>
      </aside>
      <section style={{ padding: 20 }}>문서 Workspace</section>
      <aside
        style={{
          borderLeft: "1px solid #e5e7eb",
          padding: 20,
          background: "#ffffff",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14 }}>Guidance Panel</div>
      </aside>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
