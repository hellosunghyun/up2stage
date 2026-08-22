import React, { useEffect, useMemo, useState } from "react";
import {
  messaging,
  type AttachmentPayload,
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
  textSecondary: "#6b7280",
  border: "#e5e7eb",
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};

function getUserFriendlyError(message: string): string {
  if (message.includes("Receiving end does not exist")) {
    return "현재 탭에서 확장 프로그램이 실행되지 않았어요. http/https 웹페이지에서 다시 열어주세요.";
  }
  return "문서를 불러오지 못했어요. 페이지를 새로고침하고 다시 시도해주세요.";
}

export function App() {
  const [panel, setPanel] = useState<PanelState>("DISCOVERY");
  const [attachments, setAttachments] = useState<AttachmentPayload[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        console.log("[up2stage:sidepanel] loading attachments...");
        const docs = await messaging.discoverAttachments();
        console.log("[up2stage:sidepanel] attachments loaded:", docs);
        if (!mounted) return;
        setAttachments(docs);
        setSelectedIds(new Set(docs.map((d) => d.id)));
      } catch (e) {
        console.error("[up2stage:sidepanel] attachments failed:", e);
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
          background: COLORS.bgInverse,
          borderBottom: `1px solid ${COLORS.bgInverseSurface}`,
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
          padding: 0,
          background: COLORS.bgCanvas,
        }}
      >
        {error && (
          <p style={{ padding: "16px", color: COLORS.textPrimary }}>{getUserFriendlyError(error)}</p>
        )}

        {panel === "DISCOVERY" && (
          <DiscoveryView
            attachments={attachments}
            onStart={() => setPanel("SELECTION")}
          />
        )}

        {panel === "SELECTION" && (
          <SelectionView
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
  attachments,
  onStart,
}: {
  attachments: AttachmentPayload[];
  onStart: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2
        style={{
          fontSize: 19,
          fontWeight: 700,
          color: COLORS.textPrimary,
          margin: 0,
          padding: "20px 16px 0",
        }}
      >
        복잡한 공고 문서, 바로 정리해볼까요?
      </h2>
      <p
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
          margin: 0,
          padding: "0 16px",
        }}
      >
        직접 열어볼 필요 없이 관련 문서를 함께 분석할 수 있어요.
      </p>

      {attachments.length === 0 ? (
        <p style={{ color: COLORS.textSecondary, padding: "0 16px" }}>
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
              margin: "8px 16px 0",
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
  attachments,
  selectedIds,
  onToggle,
  onSelectAll,
  onNext,
  onBack,
}: {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
        <h2
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: COLORS.textPrimary,
            margin: 0,
          }}
        >
          {selectedCount}개 선택됨
        </h2>
        <button
          onClick={() => onSelectAll(!allSelected)}
          style={{
            fontSize: 13,
            color: COLORS.actionPrimary,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>

      <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: 0, padding: "0 16px" }}>
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
          color: COLORS.textSecondary,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 16px",
        }}
      >
        <span style={{ color: COLORS.actionPrimary }}>ⓘ</span>
        선택한 문서는 Upstage AI로 전송되어 분석됩니다.
      </p>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.border}`,
            background: "transparent",
            color: COLORS.textPrimary,
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
            background: selectedCount === 0 ? COLORS.bgInverseSurface : COLORS.brandLime,
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
          color: COLORS.textPrimary,
          margin: 0,
          padding: "16px 16px 0",
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
          color: COLORS.textSecondary,
          margin: 0,
          padding: "0 16px",
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
          padding: "0 16px",
        }}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={onToggleConsent}
          style={{ marginTop: 2 }}
        />
        <span style={{ fontSize: 13, color: COLORS.textPrimary }}>
          위 문서를 AI 처리에 사용하는 데 동의합니다.
        </span>
      </label>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.border}`,
            background: "transparent",
            color: COLORS.textPrimary,
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
            background: canStart ? COLORS.brandLime : COLORS.bgInverseSurface,
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
