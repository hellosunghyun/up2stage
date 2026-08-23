import { CurrentPageCard, type PageSummary } from "../../components/PanelShell";
import { ResultCard } from "../../components/ResultCard";
import { COLORS, RADIUS } from "../../styles/tokens";
import { statusToStatusText } from "../../core/decision/evaluate";
import type { DecisionResult, RuleEvaluation } from "../../core/decision/types";

interface DecisionGuidance {
  nearestDeadline: string;
  requiredSubmissions: string[];
  nextActions: string[];
}

interface BreakdownProps {
  result: DecisionResult;
  guidance?: DecisionGuidance;
  page?: PageSummary | null;
  sourceLabels?: Record<string, string> | undefined;
  onMissingClick?: (questionId: string) => void;
  onSourceClick?: (sourceId: string) => void;
}

function statusIcon(status: RuleEvaluation["status"]): string {
  switch (status) {
    case "pass":
      return "✓";
    case "fail":
      return "✕";
    case "conflict":
      return "!";
    case "needs_more_information":
      return "?";
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
      return COLORS.warning;
  }
}

export function Breakdown({
  result,
  guidance,
  page,
  sourceLabels,
  onMissingClick,
  onSourceClick
}: BreakdownProps) {
  const passed = result.breakdown.filter((row) => row.status === "pass");
  const failed = result.breakdown.filter((row) => row.status === "fail");
  const unresolved = result.breakdown.filter(
    (row) => row.status === "needs_more_information" || row.status === "conflict"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CurrentPageCard page={page} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.4 }}>
          현재 입력 기준{" "}
          <span style={{ color: COLORS.actionPrimary }}>{statusToStatusText(result.status)}</span>
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ResultChip label={`충족 ${passed.length}`} tone="success" />
          {failed.length > 0 && <ResultChip label={`불충족 ${failed.length}`} tone="danger" />}
          {unresolved.length > 0 && (
            <ResultChip label={`확인 필요 ${unresolved.length}`} tone="warning" />
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {result.breakdown.map((row) => (
            <span
              key={row.questionId}
              style={{
                padding: "6px 9px",
                borderRadius: RADIUS.sm,
                background: COLORS.bgInverseSurface,
                color: statusColor(row.status),
                fontSize: 10
              }}
            >
              {statusIcon(row.status)} {row.label}{" "}
              {row.input === null ? "미입력" : String(row.input)}
            </span>
          ))}
        </div>
      </div>

      {unresolved.length > 0 && (
        <ResultCard
          title="확인해야 할 조건"
          body={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {unresolved.map((row) => (
                <li key={row.questionId} style={{ marginBottom: 4 }}>
                  {row.label}: {row.reason}{" "}
                  {row.status === "needs_more_information" && onMissingClick && (
                    <button
                      type="button"
                      onClick={() => onMissingClick(row.questionId)}
                      style={{
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        color: COLORS.brandLime,
                        cursor: "pointer",
                        fontSize: 11
                      }}
                    >
                      입력하기
                    </button>
                  )}
                </li>
              ))}
            </ul>
          }
          accent="lime"
          sourceIds={[...new Set(unresolved.flatMap((row) => row.sourceIds ?? []))]}
          sourceLabels={sourceLabels}
          onSourceClick={onSourceClick}
        />
      )}

      {guidance && (
        <>
          <ResultCard title="가장 가까운 마감" body={guidance.nearestDeadline} accent="neutral" />
          <ResultCard
            title={`필수 서류 (${guidance.requiredSubmissions.length})`}
            body={guidance.requiredSubmissions.join(" · ")}
            accent="neutral"
          />
          <ResultCard
            title="지금 해야 할 일"
            body={guidance.nextActions.join(" → ")}
            accent="neutral"
          />
        </>
      )}

      <details style={{ color: COLORS.textInverseSecondary }}>
        <summary style={{ fontSize: 12, cursor: "pointer" }}>조건별 판단 자세히 보기</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {result.breakdown.map((row) => (
            <section
              key={row.questionId}
              style={{
                padding: 12,
                borderRadius: RADIUS.sm,
                background: COLORS.bgInverseSurface,
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <strong style={{ fontSize: 13, color: statusColor(row.status) }}>
                {statusIcon(row.status)} {row.label}
              </strong>
              <span style={{ fontSize: 11, lineHeight: 1.5 }}>
                입력: {row.input === null ? "미입력" : String(row.input)}
                <br />
                기준: {row.criterion}
                <br />
                {row.reason}
              </span>
              {row.sourceIds && row.sourceIds.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {row.sourceIds.map((sourceId) => (
                    <button
                      key={sourceId}
                      type="button"
                      onClick={() => onSourceClick?.(sourceId)}
                      style={{
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        color: COLORS.actionPrimary,
                        fontSize: 10,
                        cursor: onSourceClick ? "pointer" : "default"
                      }}
                    >
                      {sourceLabels?.[sourceId] ?? sourceId}
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}

function ResultChip({ label, tone }: { label: string; tone: "success" | "warning" | "danger" }) {
  const color =
    tone === "success" ? COLORS.brandLime : tone === "danger" ? "#ff6b6b" : COLORS.warning;
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: RADIUS.sm,
        background: COLORS.bgInverseSurface,
        color,
        fontSize: 11,
        fontWeight: 700
      }}
    >
      {label}
    </span>
  );
}
