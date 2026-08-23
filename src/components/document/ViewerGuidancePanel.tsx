import type { DocumentRecord, SourceRecord } from "../../models/canonical";
import {
  navigateToSource,
  type SourceRegistry,
  type ViewerHost
} from "../../features/source-navigation/navigate";
import { SuggestionChips } from "../../features/quick-check/SuggestionChips";
import { ChatComposer } from "../PanelShell";
import { SourceBadge } from "../evidence/SourceBadge";
import { COLORS, RADIUS } from "../../styles/tokens";

export interface ViewerGuidanceData {
  overview: string;
  topRequirements: string[];
  nearestDeadline: string;
  requiredSubmissions: string[];
  nextActions: string[];
  sourceGroups: {
    topRequirements: string[];
    nearestDeadline: string[];
    requiredSubmissions: string[];
  };
  sourceLabels: Record<string, string>;
}

export function ViewerGuidancePanel({
  caseId,
  guidance,
  activeSource,
  selectedDocument,
  sources,
  sourceRegistry,
  viewer
}: {
  caseId: string;
  guidance?: ViewerGuidanceData | undefined;
  activeSource: SourceRecord | null;
  selectedDocument: DocumentRecord | undefined;
  sources: SourceRecord[];
  sourceRegistry: SourceRegistry;
  viewer: ViewerHost;
}) {
  const filteredSources = sources.filter((source) => source.documentId === selectedDocument?.id);
  const activeSourceNumber = activeSource
    ? filteredSources.findIndex((source) => source.sourceId === activeSource.sourceId) + 1
    : undefined;

  const openSource = (sourceId: string | undefined) => {
    if (!sourceId) return;
    void navigateToSource(sourceId, sourceRegistry, viewer);
  };

  return (
    <aside
      aria-label={`AI 안내 및 근거 · Up to Stage case ${caseId}`}
      style={{
        borderLeft: `1px solid ${COLORS.bgInverseSurface}`,
        background: COLORS.bgInverse,
        color: COLORS.textOnInverse,
        display: "flex",
        flexDirection: "column",
        minHeight: 0
      }}
    >
      <header
        style={{
          height: 64,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${COLORS.bgInverseSurface}`,
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 14,
              background: COLORS.brandLime,
              transform: "skew(-24deg)"
            }}
          />
          <strong style={{ fontSize: 16 }}>Up to Stage</strong>
        </div>
        <span aria-hidden="true" style={{ fontSize: 20 }}>
          ⋮
        </span>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 20 }}>
        {activeSource && (
          <section
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
              marginBottom: 20
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {activeSourceNumber !== undefined && activeSourceNumber > 0 && (
                <SourceBadge number={activeSourceNumber} />
              )}
              <span style={{ fontSize: 11, color: COLORS.textInverseSecondary }}>
                {selectedDocument?.fileName} · {activeSource.page}쪽
              </span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>
              &quot;{activeSource.text}&quot;
            </p>
          </section>
        )}

        {guidance ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 21 }}>주요 요약</h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: COLORS.textInverseSecondary
                }}
              >
                {guidance.overview}
              </p>
            </div>

            <SummarySection title="1. 지원 자격">
              {guidance.topRequirements.map((requirement, index) => (
                <SummaryLine
                  key={`${requirement}-${index}`}
                  text={requirement}
                  number={index + 1}
                  onClick={() => openSource(guidance.sourceGroups.topRequirements[index])}
                />
              ))}
            </SummarySection>

            <SummarySection title="2. 신청 안내">
              <SummaryLine
                text={guidance.nearestDeadline}
                number={guidance.topRequirements.length + 1}
                onClick={() => openSource(guidance.sourceGroups.nearestDeadline[0])}
              />
              {guidance.nextActions.slice(0, 2).map((action, index) => (
                <SummaryLine key={`${action}-${index}`} text={action} />
              ))}
            </SummarySection>

            <SummarySection title="3. 제출 서류">
              <SummaryLine
                text={guidance.requiredSubmissions.join(" · ")}
                number={guidance.topRequirements.length + 2}
                onClick={() => openSource(guidance.sourceGroups.requiredSubmissions[0])}
              />
            </SummarySection>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: RADIUS.md,
                background: COLORS.bgInverseSurface,
                fontSize: 11,
                lineHeight: 1.5,
                color: COLORS.textInverseSecondary
              }}
            >
              근거를 누르면 원문의 위치로 이동합니다. 숫자 라벨은 요약 문장과 원문을 연결해요.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
              color: COLORS.textInverseSecondary,
              fontSize: 13
            }}
          >
            근거를 눌러 원문의 위치로 이동하세요.
          </div>
        )}

        <details style={{ marginTop: 20, color: COLORS.textInverseSecondary }}>
          <summary style={{ fontSize: 12, cursor: "pointer" }}>문서별 근거 보기</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {filteredSources.map((source, index) => (
              <button
                key={source.sourceId}
                type="button"
                onClick={() => openSource(source.sourceId)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: 10,
                  border: "none",
                  borderRadius: RADIUS.sm,
                  background: COLORS.bgInverseSurface,
                  color: COLORS.textOnInverse,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <SourceBadge number={index + 1} />
                <span style={{ fontSize: 12, lineHeight: 1.4 }}>{source.text}</span>
              </button>
            ))}
          </div>
        </details>
      </div>

      <div
        style={{
          padding: "12px 20px 16px",
          borderTop: `1px solid ${COLORS.bgInverseSurface}`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flexShrink: 0
        }}
      >
        <SuggestionChips onSelect={() => {}} disabled />
        <ChatComposer />
      </div>
    </aside>
  );
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
      {children}
    </section>
  );
}

function SummaryLine({
  text,
  number,
  onClick
}: {
  text: string;
  number?: number;
  onClick?: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color: COLORS.textInverseSecondary, fontSize: 13 }}>•</span>
      <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>{text}</span>
      {number !== undefined && (
        <button
          type="button"
          onClick={onClick}
          disabled={!onClick}
          aria-label={`${number}번 근거로 이동`}
          style={{
            width: 24,
            height: 24,
            borderRadius: RADIUS.sm,
            border: "none",
            background: COLORS.brandLime,
            color: COLORS.textPrimary,
            fontSize: 11,
            fontWeight: 700,
            cursor: onClick ? "pointer" : "default",
            flexShrink: 0
          }}
        >
          {number}
        </button>
      )}
    </div>
  );
}
import type { ReactNode } from "react";
