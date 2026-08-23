import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getApiKey, setApiKey, clearApiKey } from "../../src/core/storage/apiKey";

function App() {
  const [apiKey, setKeyState] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const key = await getApiKey();
      setSaved(key ? "••••••" : null);
    })();
  }, []);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    try {
      await setApiKey(trimmed);
      setSaved("••••••");
      setKeyState("");
      setStatus("API Key가 저장되었어요.");
    } catch {
      setStatus("저장에 실패했어요.");
    }
  };

  const handleClear = async () => {
    await clearApiKey();
    setSaved(null);
    setStatus("API Key가 삭제되었어요.");
  };

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

      <section
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Upstage API Key</h2>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 12px" }}>
          API Key는 이 브라우저 세션 동안에만 메모리에 보관됩니다. 확장 프로그램을
          완전히 종료하면 삭제됩니다.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setKeyState(e.target.value)}
          placeholder="up-..."
          style={{
            width: "100%",
            padding: 12,
            fontSize: 14,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={() => void handleSave()}
            disabled={!apiKey.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: apiKey.trim() ? "#5b52ff" : "#e5e7eb",
              color: apiKey.trim() ? "#fff" : "#9ca3af",
              fontSize: 14,
              fontWeight: 600,
              cursor: apiKey.trim() ? "pointer" : "not-allowed",
            }}
          >
            저장
          </button>
          {saved && (
            <button
              onClick={() => void handleClear()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          )}
        </div>
        {saved && (
          <p style={{ fontSize: 13, color: "#059669", margin: "12px 0 0" }}>
            저장된 Key: {saved}
          </p>
        )}
        {status && !saved && (
          <p style={{ fontSize: 13, color: "#666", margin: "12px 0 0" }}>
            {status}
          </p>
        )}
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
