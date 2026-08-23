import { COLORS, RADIUS } from "../../styles/tokens";
import type { ApplicationFormExtract } from "./types";

interface ApplicationFormCheckProps {
  extract: ApplicationFormExtract;
}

export function ApplicationFormCheck({ extract }: ApplicationFormCheckProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.textInverseSecondary,
            marginBottom: 6,
          }}
        >
          필수 입력
        </div>
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {extract.required_fields.map((field, i) => (
            <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
              {field}
            </li>
          ))}
        </ul>
      </div>

      {extract.format_constraints.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textInverseSecondary,
              marginBottom: 6,
            }}
          >
            형식
          </div>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {extract.format_constraints.map((c, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {extract.form_cautions.length > 0 && (
        <div
          style={{
            borderRadius: RADIUS.sm,
            padding: 10,
            background: "rgba(245,158,11,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.warning,
              marginBottom: 6,
            }}
          >
            주의
          </div>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {extract.form_cautions.map((c, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
