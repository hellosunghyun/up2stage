import { useState } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";
import type { SubmissionItem } from "./types";
import { stripCitations } from "./helpers";

interface SubmissionChecklistProps {
  items: (SubmissionItem | string)[];
}

function parseSubmission(raw: string, required = true): SubmissionItem {
  const text = stripCitations(raw);
  const parts = text.split("|").map((p) => p.trim());
  const title = parts[0]!;
  const condition = parts.length >= 2 ? parts[1] : undefined;
  return {
    title,
    required,
    ...(condition ? { condition } : {}),
  };
}

export function SubmissionChecklist({ items }: SubmissionChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const entries = items.map((raw) =>
    typeof raw === "string" ? parseSubmission(raw) : raw
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {entries.map((item, index) => {
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
              background: item.required
                ? "rgba(255,255,255,0.04)"
                : "transparent",
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
            <div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                {item.required ? "☐" : "△"} {item.title}
              </div>
              {item.condition && (
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.textInverseSecondary,
                    marginTop: 2,
                  }}
                >
                  {item.condition}
                </div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
