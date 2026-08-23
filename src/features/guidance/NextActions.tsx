import { useState } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";
import { stripCitations } from "./helpers";

interface NextActionsProps {
  items: string[];
}

export function NextActions({ items }: NextActionsProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((raw, index) => {
        const text = stripCitations(raw);
        const isChecked = checked[index] ?? false;
        return (
          <label
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px",
              borderRadius: RADIUS.sm,
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) =>
                setChecked((prev) => ({ ...prev, [index]: e.target.checked }))
              }
              style={{ marginTop: 2 }}
            />
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                textDecoration: isChecked ? "line-through" : "none",
                color: isChecked
                  ? COLORS.textInverseSecondary
                  : COLORS.textOnInverse,
              }}
            >
              {text}
            </span>
          </label>
        );
      })}
    </div>
  );
}
