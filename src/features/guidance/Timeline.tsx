import { COLORS, RADIUS } from "../../styles/tokens";
import { stripCitations } from "./helpers";

interface TimelineProps {
  items: string[];
  max?: number;
}

export function Timeline({ items, max = 4 }: TimelineProps) {
  const trimmed = items.slice(0, max);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {trimmed.map((item, index) => {
        const text = stripCitations(item);
        const isDeadline = /마감|종료|마지막/.test(text);
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px",
              borderRadius: RADIUS.sm,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                marginTop: 6,
                background: isDeadline ? COLORS.brandLime : "#5b52ff",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, lineHeight: 1.5 }}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}
