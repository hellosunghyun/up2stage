import React from "react";

export function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#0a0d14",
        background: "#ffffff",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          height: 64,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>up to stage</div>
      </header>
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "#666" }}>
          이 페이지와 관련된 문서를 정리하는 Side Panel입니다.
        </p>
      </main>
      <footer
        style={{
          flexShrink: 0,
          padding: 16,
          borderTop: "1px solid #e5e7eb",
        }}
      />
    </div>
  );
}
