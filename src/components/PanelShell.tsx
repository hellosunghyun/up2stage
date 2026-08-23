import type { ReactNode } from "react";
import { COLORS, RADIUS } from "../styles/tokens";

export interface PageSummary {
  title: string;
  url?: string | undefined;
}

export function PanelShell({
  header,
  children,
  footer
}: {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        minWidth: 360,
        fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: COLORS.textOnInverse,
        background: COLORS.bgInverse
      }}
    >
      {header}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "20px",
          background: COLORS.bgInverse
        }}
      >
        {children}
      </main>
      {footer}
    </div>
  );
}

export function PanelHeader({
  loading,
  onRefresh,
  onMenu
}: {
  loading: boolean;
  onRefresh: () => void;
  onMenu: () => void;
}) {
  const iconButtonStyle = {
    width: 36,
    height: 36,
    border: "none",
    borderRadius: RADIUS.sm,
    background: "transparent",
    color: COLORS.textOnInverse,
    fontSize: 20,
    cursor: "pointer"
  } as const;

  return (
    <header
      style={{
        flexShrink: 0,
        height: 64,
        padding: "0 12px 0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: COLORS.bgInverse,
        borderBottom: `1px solid ${COLORS.bgInverseSurface}`
      }}
    >
      <img
        src={chrome.runtime.getURL("logo.png")}
        alt="Up to Stage"
        style={{ height: 42, width: "auto", objectFit: "contain" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="첨부 문서 다시 찾기"
          title="현재 페이지 다시 확인"
          style={{
            ...iconButtonStyle,
            color: loading ? COLORS.textInverseSecondary : COLORS.textOnInverse,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          ↻
        </button>
        <button
          type="button"
          onClick={onMenu}
          aria-label="설정 열기"
          title="설정 열기"
          style={iconButtonStyle}
        >
          ⋮
        </button>
      </div>
    </header>
  );
}

export function CurrentPageCard({ page }: { page?: PageSummary | null | undefined }) {
  if (!page) return null;

  let host = "현재 페이지";
  if (page.url) {
    try {
      host = new URL(page.url).hostname;
    } catch {
      host = "현재 페이지";
    }
  }

  return (
    <section
      aria-label="현재 페이지"
      style={{
        padding: "13px 16px",
        borderRadius: RADIUS.md,
        background: COLORS.bgInverseSurface,
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}
    >
      <span style={{ fontSize: 11, color: COLORS.textInverseSecondary }}>현재 페이지</span>
      <strong
        style={{
          fontSize: 13,
          color: COLORS.textOnInverse,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {page.title}
      </strong>
      <span
        style={{
          fontSize: 11,
          color: COLORS.actionPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {host}
      </span>
    </section>
  );
}

export function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "12px 20px 16px",
        borderTop: `1px solid ${COLORS.bgInverseSurface}`,
        background: COLORS.bgInverse
      }}
    >
      {children}
    </div>
  );
}

export function ChatComposer({
  value = "",
  onChange,
  onSubmit,
  disabled = false,
  busy = false
}: {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  busy?: boolean;
} = {}) {
  const interactive = Boolean(onChange && onSubmit) && !disabled;
  return (
    <form
      aria-label="후속 질문 입력"
      aria-disabled={!interactive}
      title={interactive ? undefined : "문서 분석 후 질문할 수 있어요"}
      onSubmit={(event) => {
        event.preventDefault();
        if (interactive && !busy && value.trim()) onSubmit?.();
      }}
      style={{
        height: 52,
        padding: "0 14px 0 16px",
        border: `1px solid ${COLORS.actionPrimary}`,
        borderRadius: RADIUS.md,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: COLORS.textInverseSecondary,
        fontSize: 13,
        gap: 8
      }}
    >
      <input
        aria-label="궁금한 것을 물어보세요"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={!interactive || busy}
        placeholder={busy ? "원문 근거를 확인하고 있어요" : "궁금한 것을 물어보세요"}
        style={{
          minWidth: 0,
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: COLORS.textOnInverse,
          fontSize: 13
        }}
      />
      <button
        type="submit"
        aria-label="질문 보내기"
        disabled={!interactive || busy || value.trim().length === 0}
        style={{
          border: "none",
          background: "transparent",
          color: COLORS.actionPrimary,
          fontSize: 20,
          cursor: interactive && !busy && value.trim() ? "pointer" : "not-allowed"
        }}
      >
        ↗
      </button>
    </form>
  );
}

export function ScreenIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {eyebrow && (
        <span
          style={{
            alignSelf: "flex-start",
            padding: "4px 8px",
            borderRadius: 999,
            background: COLORS.brandLime,
            color: COLORS.textPrimary,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2 style={{ fontSize: 22, lineHeight: 1.35, fontWeight: 700, margin: 0 }}>{title}</h2>
      {description && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: COLORS.textInverseSecondary,
            margin: 0
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
