import React from "react";

export interface OverlayProps {
  ruleLabel?: string;
  onOpen: () => void;
  onClose: () => void;
}

export function ContextualOverlay({ onOpen, onClose }: OverlayProps) {
  return (
    <div
      role="dialog"
      aria-label="up to stage 안내"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: 336,
        zIndex: 2147483647,
        padding: 20,
        borderRadius: 12,
        background: "#111722",
        color: "#ffffff",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.24)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        up to stage
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 16,
          color: "#ffffff",
        }}
      >
        이 페이지와 관련된 문서를 확인할 수 있어요.
        <br />
        조건, 마감, 제출서류를 함께 정리합니다.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onOpen}
          style={{
            background: "#d2ff95",
            color: "#0a0d14",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          관련 문서 확인하기 →
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            color: "#ffffff",
            border: "1px solid #8390a5",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
