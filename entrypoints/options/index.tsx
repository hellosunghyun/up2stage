import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
        maxWidth: 720,
      }}
    >
      <h1 style={{ fontSize: 20, margin: 0 }}>up to stage 설정</h1>
      <p style={{ fontSize: 14, color: "#666" }}>
        API 연결, 캐시 삭제, 진단 설정 등 제품 전역 설정을 이곳에서 관리합니다.
      </p>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
