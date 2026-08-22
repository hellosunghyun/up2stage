import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 18, margin: 0 }}>up to stage</h1>
      <p style={{ fontSize: 14, color: "#666" }}>
        이 페이지와 관련된 문서를 정리하는 Side Panel입니다.
      </p>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
