import React, { useEffect, useMemo, useState } from "react";
import {
  messaging,
  type AttachmentPayload,
  type PageContext,
} from "../../src/core/messaging/protocol";
import {
  canStartAnalysis,
  getSelected,
} from "../../src/features/document-selection/selection";

type PanelState = "DISCOVERY" | "SELECTION" | "CONSENT_CONFIRM";

const COLORS = {
  bgCanvas: "#ffffff",
  bgInverse: "#0a0d14",
  bgInverseSurface: "#111722",
  brandLime: "#d2ff95",
  actionPrimary: "#5b52ff",
  textPrimary: "#0a0d14",
  textOnInverse: "#ffffff",
  textInverseSecondary: "#8390a5",
  border: "#e5e7eb",
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};

export function App() {
  const [panel, setPanel] = useState<PanelState>("DISCOVERY");
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [attachments, setAttachments] = useState<AttachmentPayload[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [ctx, docs] = await Promise.all([
          messaging.currentPageContext(),
          messaging.discoverAttachments(),
        ]);
        if (!mounted) return;
        setPageContext(ctx);
        setAttachments(docs);
        setSelectedIds(new Set(docs.map((d) => d.id)));
      } catch (e) {
        if (!mounted) return;
        setError(
          e instanceof Error ? e.message : "문서를 불러오지 못했어요."
        );
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedDocs = useMemo(
    () => getSelected(attachments, selectedIds),
    [attachments, selectedIds]
  );
  const canStart = canStartAnalysis({ selectedIds, consentChecked });

  const toggleDoc = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (value: boolean) => {
    setSelectedIds(
      value ? new Set(attachments.map((a) => a.id)) : new Set()
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: COLORS.textPrimary,
        background: COLORS.bgCanvas,
      }}
    >
      <header
        style={{
          flexShrink: 0,
          height: 64,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark />
          <span style={{ fontWeight: 700, fontSize: 20, color: COLORS.textOnInverse }}>
            up to stage
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          background: COLORS.bgInverse,
        }}
      >
        {error && (
          <p style={{ color: COLORS.textInverseSecondary }}>{error}</p>
        )}

        {panel === "DISCOVERY" && (
          <DiscoveryView
            pageContext={pageContext}
            attachments={attachments}
            onStart={() => setPanel("SELECTION")}
          />
        )}

        {panel === "SELECTION" && (
          <SelectionView
            pageContext={pageContext}
            attachments={attachments}
            selectedIds={selectedIds}
            onToggle={toggleDoc}
            onSelectAll={selectAll}
            onNext={() => {
              setConsentChecked(false);
              setPanel("CONSENT_CONFIRM");
            }}
            onBack={() => setPanel("DISCOVERY")}
          />
        )}

        {panel === "CONSENT_CONFIRM" && (
          <ConsentView
            selectedDocs={selectedDocs}
            canStart={canStart}
            consentChecked={consentChecked}
            onToggleConsent={() => setConsentChecked((v) => !v)}
            onStart={() => {
              console.log("Phase 3: upload", selectedDocs);
            }}
            onBack={() => setPanel("SELECTION")}
          />
        )}
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          background: COLORS.actionPrimary,
          transform: "rotate(45deg)",
        }}
      />
    </div>
  );
}

function DiscoveryView({
  pageContext,
  attachments,
  onStart,
}: {
  pageContext: PageContext | null;
  attachments: AttachmentPayload[];
  onStart: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageContextCard pageContext={pageContext} />

      <h2
        style={{
          fontSize: 19,
          fontWeight: 700,
          color: COLORS.textOnInverse,
          margin: 0,
        }}
      >
        복잡한 공고 문서, 바로 정리해볼까요?
      </h2>
      <p
        style={{
          fontSize: 14,
          color: COLORS.textInverseSecondary,
          margin: 0,
        }}
      >
        직접 열어볼 필요 없이 관련 문서를 함께 분석할 수 있어요.
      </p>

      {attachments.length === 0 ? (
        <p style={{ color: COLORS.textInverseSecondary }}>
          현재 페이지에서 지원하는 형식의 첨부 문서를 찾지 못했어요.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {attachments.map((a) => (
              <DocChip key={a.id} doc={a} />
            ))}
          </div>

          <button
            onClick={onStart}
            style={{
              marginTop: 8,
              padding: "14px 16px",
              borderRadius: RADIUS.md,
              border: "none",
              background: COLORS.brandLime,
              color: COLORS.textPrimary,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            문서 선택하기
          </button>
        </>
      )}
    </div>
  );
}

function SelectionView({
  pageContext,
  attachments,
  selectedIds,
  onToggle,
  onSelectAll,
  onNext,
  onBack,
}: {
  pageContext: PageContext | null;
  attachments: AttachmentPayload[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const selectedCount = selectedIds.size;
  const allSelected = attachments.length > 0 && selectedCount === attachments.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageContextCard pageContext={pageContext} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: COLORS.textOnInverse,
            margin: 0,
          }}
        >
          {selectedCount}개 선택됨
        </h2>
        <button
          onClick={() => onSelectAll(!allSelected)}
          style={{
            fontSize: 13,
            color: COLORS.brandLime,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>

      <p style={{ fontSize: 14, color: COLORS.textInverseSecondary, margin: 0 }}>
        함께 분석할 문서를 골라주세요.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {attachments.map((a) => (
          <DocSelectRow
            key={a.id}
            doc={a}
            selected={selectedIds.has(a.id)}
            onToggle={() => onToggle(a.id)}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: 12,
          color: COLORS.textInverseSecondary,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ color: COLORS.actionPrimary }}>ⓘ</span>
        선택한 문서는 Upstage AI로 전송되어 분석됩니다.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.textInverseSecondary}`,
            background: "transparent",
            color: COLORS.textOnInverse,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={selectedCount === 0}
          style={{
            flex: 2,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: "none",
            background: selectedCount === 0 ? "#2a2f3b" : COLORS.brandLime,
            color: selectedCount === 0 ? COLORS.textInverseSecondary : COLORS.textPrimary,
            fontSize: 15,
            fontWeight: 700,
            cursor: selectedCount === 0 ? "not-allowed" : "pointer",
          }}
        >
          선택한 문서 분석하기
        </button>
      </div>
    </div>
  );
}

function ConsentView({
  selectedDocs,
  canStart,
  consentChecked,
  onToggleConsent,
  onStart,
  onBack,
}: {
  selectedDocs: AttachmentPayload[];
  canStart: boolean;
  consentChecked: boolean;
  onToggleConsent: () => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2
        style={{
          fontSize: 19,
          fontWeight: 700,
          color: COLORS.textOnInverse,
          margin: 0,
        }}
      >
        선택한 문서를 확인해주세요.
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selectedDocs.map((a) => (
          <DocChip key={a.id} doc={a} />
        ))}
      </div>

      <p
        style={{
          fontSize: 14,
          color: COLORS.textInverseSecondary,
          margin: 0,
        }}
      >
        이 문서는 Upstage를 통해 처리됩니다.
      </p>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={onToggleConsent}
          style={{ marginTop: 2 }}
        />
        <span style={{ fontSize: 13, color: COLORS.textOnInverse }}>
          위 문서를 AI 처리에 사용하는 데 동의합니다.
        </span>
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.textInverseSecondary}`,
            background: "transparent",
            color: COLORS.textOnInverse,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          이전
        </button>
        <button
          onClick={onStart}
          disabled={!canStart}
          style={{
            flex: 2,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: "none",
            background: canStart ? COLORS.brandLime : "#2a2f3b",
            color: canStart ? COLORS.textPrimary : COLORS.textInverseSecondary,
            fontSize: 15,
            fontWeight: 700,
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          분석 시작
        </button>
      </div>
    </div>
  );
}

function PageContextCard({ pageContext }: { pageContext: PageContext | null }) {
  if (!pageContext) return null;

  return (
    <div
      style={{
        padding: 12,
        borderRadius: RADIUS.md,
        background: COLORS.bgInverseSurface,
        color: COLORS.textOnInverse,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {pageContext.title}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: COLORS.textInverseSecondary,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {pageContext.url}
      </div>
    </div>
  );
}

function DocChip({ doc }: { doc: AttachmentPayload }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px",
        borderRadius: RADIUS.md,
        background: COLORS.bgInverseSurface,
        color: COLORS.textOnInverse,
      }}
    >
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 9999,
          background: COLORS.bgInverse,
          color: COLORS.actionPrimary,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {doc.extension?.toUpperCase() ?? "FILE"}
      </span>
      <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {doc.fileName}
      </span>
    </div>
  );
}

function DocSelectRow({
  doc,
  selected,
  onToggle,
}: {
  doc: AttachmentPayload;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "12px",
        borderRadius: RADIUS.md,
        background: selected ? COLORS.brandLime : COLORS.bgInverseSurface,
        color: selected ? COLORS.textPrimary : COLORS.textOnInverse,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: selected ? COLORS.bgInverse : "transparent",
            border: selected ? "none" : `1px solid ${COLORS.textInverseSecondary}`,
          }}
        >
          {selected && <span style={{ color: COLORS.brandLime, fontSize: 12 }}>✓</span>}
        </div>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 9999,
            background: COLORS.bgInverse,
            color: selected ? COLORS.textPrimary : COLORS.actionPrimary,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {doc.extension?.toUpperCase() ?? "FILE"}
        </span>
        <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {doc.fileName}
        </span>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 8px",
          borderRadius: 9999,
          background: selected ? COLORS.bgInverse : COLORS.bgInverse,
          color: selected ? COLORS.brandLime : COLORS.textInverseSecondary,
          whiteSpace: "nowrap",
        }}
      >
        {selected ? "선택됨" : "선택 안 함"}
      </span>
    </div>
  );
}
