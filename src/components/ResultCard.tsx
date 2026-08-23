import type { ReactNode } from "react";
import { COLORS, RADIUS } from "../styles/tokens";

export interface ResultCardProps {
  title: string;
  body: ReactNode;
  sourceIds?: string[] | undefined;
  accent?: "lime" | "neutral" | "warning";
  onSourceClick?: (sourceId: string) => void;
}

const ACCENT: Record<NonNullable<ResultCardProps["accent"]>, string> = {
  lime: COLORS.brandLime,
  neutral: "transparent",
  warning: COLORS.warning,
};

export function ResultCard({
  title,
  body,
  sourceIds,
  accent = "lime",
  onSourceClick,
}: ResultCardProps) {
  return (
    <section
      style={{
        borderRadius: RADIUS.md,
        background: COLORS.bgInverseSurface,
        color: COLORS.textOnInverse,
        borderLeft: `4px solid ${ACCENT[accent]}`,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {title}
      </h3>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.textOnInverse }}>
        {body}
      </div>
      {sourceIds && sourceIds.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sourceIds.map((sourceId) => (
            <button
              key={sourceId}
              onClick={() => onSourceClick?.(sourceId)}
              style={{
                padding: "4px 8px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${COLORS.textInverseSecondary}`,
                background: "transparent",
                color: COLORS.textInverseSecondary,
                fontSize: 11,
                cursor: onSourceClick ? "pointer" : "default",
              }}
            >
              {sourceId}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
