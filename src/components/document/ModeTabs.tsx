type ViewerMode = "structure" | "original" | "accessibility";

export interface ModeTabsProps {
  mode: ViewerMode;
  onChange: (mode: ViewerMode) => void;
}

const labels: Record<ViewerMode, string> = {
  structure: "구조 보기",
  original: "원문 보기",
  accessibility: "접근성 보기",
};

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
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
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(m)}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: 8,
              background: active ? "#0a0d14" : "transparent",
              color: active ? "#ffffff" : "#0a0d14",
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
