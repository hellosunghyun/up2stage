import type { ReactNode } from "react";
import { COLORS, RADIUS } from "../styles/tokens";

export interface ResultCardProps {
  title: string;
  body: ReactNode;
  sourceIds?: string[] | undefined;
  sourceLabels?: Record<string, string> | undefined;
  accent?: "lime" | "neutral" | "warning";
  onSourceClick?: (sourceId: string) => void;
}

const ACCENT: Record<NonNullable<ResultCardProps["accent"]>, string> = {
  lime: COLORS.brandLime,
  neutral: "transparent",
  warning: COLORS.warning
};

export function ResultCard({
  title,
  body,
  sourceIds,
  sourceLabels,
  accent = "lime",
  onSourceClick
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
        gap: 8
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.4
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.55,
          color: COLORS.textInverseSecondary
        }}
      >
        {body}
      </div>
      {sourceIds && sourceIds.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sourceIds.map((sourceId) => (
            <button
              key={sourceId}
              onClick={() => onSourceClick?.(sourceId)}
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                color: COLORS.actionPrimary,
                fontSize: 11,
                cursor: onSourceClick ? "pointer" : "default"
              }}
            >
              {sourceLabels?.[sourceId] ?? sourceId}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
