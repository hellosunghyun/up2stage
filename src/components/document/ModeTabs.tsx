import type { RefObject } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";

type ViewerMode = "structure" | "original" | "accessibility";

export interface ModeTabsProps {
  mode: ViewerMode;
  onChange: (mode: ViewerMode) => void;
  accessibilityTabRef?: RefObject<HTMLButtonElement | null> | undefined;
}

const labels: Record<ViewerMode, string> = {
  structure: "구조 보기",
  original: "원문 보기",
  accessibility: "접근성 보기",
};

export function ModeTabs({ mode, onChange, accessibilityTabRef }: ModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="보기 모드"
      style={{ display: "flex", gap: 4 }}
    >
      {(Object.keys(labels) as ViewerMode[]).map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            id={`viewer-mode-${m}`}
            ref={m === "accessibility" ? accessibilityTabRef : undefined}
            role="tab"
            aria-selected={active}
            aria-controls="viewer-workspace-panel"
            tabIndex={0}
            type="button"
            onClick={() => onChange(m)}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: RADIUS.sm,
              background: active ? COLORS.bgInverse : "transparent",
              color: active ? COLORS.textOnInverse : COLORS.textPrimary,
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {labels[m]}
          </button>
        );
      })}
    </div>
  );
}
