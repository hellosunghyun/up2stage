import { COLORS, RADIUS } from "../../styles/tokens";

export interface SourceBadgeProps {
  number: number;
}

export function SourceBadge({ number }: SourceBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: RADIUS.sm,
        background: COLORS.brandLime,
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
      aria-label={`근거 ${number}`}
    >
      {number}
    </span>
  );
}
