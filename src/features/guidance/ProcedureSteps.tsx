import { COLORS, RADIUS } from "../../styles/tokens";
import type { ProcedureExtract } from "./types";
import { stripCitations } from "./helpers";

interface ProcedureStepsProps {
  extract: ProcedureExtract;
}

export function ProcedureSteps({ extract }: ProcedureStepsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ol
        style={{
          margin: 0,
          padding: "0 0 0 22px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {extract.steps.map((step, i) => (
          <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
            {stripCitations(step)}
          </li>
        ))}
      </ol>

      {extract.completion_checks.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.brandLime,
              marginBottom: 6,
            }}
          >
            완료 확인
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
            {extract.completion_checks.map((c, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: COLORS.textOnInverse,
                }}
              >
                ✓ {stripCitations(c)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {extract.procedure_cautions.length > 0 && (
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
            진행 시 주의
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
            {extract.procedure_cautions.map((c, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                {stripCitations(c)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
