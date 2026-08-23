import { COLORS, RADIUS } from "../../styles/tokens";
import { statusToStatusText } from "../../core/decision/evaluate";
import type { DecisionResult, RuleEvaluation } from "../../core/decision/types";

interface BreakdownProps {
  result: DecisionResult;
  onMissingClick?: (questionId: string) => void;
  onSourceClick?: (sourceId: string) => void;
}

function statusIcon(status: RuleEvaluation["status"]): string {
  switch (status) {
    case "pass":
      return "✓";
    case "fail":
      return "✗";
    case "conflict":
      return "!";
    case "needs_more_information":
      return "?";
    default:
      return "";
  }
}

function statusColor(status: RuleEvaluation["status"]): string {
  switch (status) {
    case "pass":
      return COLORS.brandLime;
    case "fail":
      return "#ff6b6b";
    case "conflict":
      return COLORS.warning;
    case "needs_more_information":
      return COLORS.textInverseSecondary;
    default:
      return COLORS.textOnInverse;
  }
}

export function Breakdown({
  result,
  onMissingClick,
  onSourceClick,
}: BreakdownProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          color: COLORS.textOnInverse,
          fontSize: 15,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {statusToStatusText(result.status)}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textOnInverse }}>
        지원 조건
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {result.breakdown.map((row) => (
          <div
            key={row.questionId}
            style={{
              padding: 12,
              borderRadius: RADIUS.sm,
              background: COLORS.bgInverseSurface,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {statusIcon(row.status)}{" "}
                <span style={{ color: statusColor(row.status) }}>
                  {row.label}
                </span>
              </span>
              {row.status === "needs_more_information" && onMissingClick && (
                <button
                  onClick={() => onMissingClick(row.questionId)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: COLORS.brandLime,
                    fontSize: 12,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  [입력하기]
                </button>
              )}
            </div>

            <div
              style={{
                fontSize: 13,
                color: COLORS.textInverseSecondary,
                lineHeight: 1.5,
              }}
            >
              입력: {row.input === null ? "미입력" : String(row.input)}
              <br />
              기준: {row.criterion}
              <br />
              <span style={{ color: statusColor(row.status) }}>
                {row.reason}
              </span>
            </div>

            {row.sourceIds && row.sourceIds.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {row.sourceIds.map((sourceId) => (
                  <button
                    key={sourceId}
                    onClick={() => onSourceClick?.(sourceId)}
                    style={{
                      padding: "3px 6px",
                      borderRadius: 4,
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
          </div>
        ))}
      </div>
    </div>
  );
}
