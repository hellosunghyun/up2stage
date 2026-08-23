import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  messaging,
  type AttachmentPayload,
} from "../../src/core/messaging/protocol";
import {
  canStartAnalysis,
  getSelected,
} from "../../src/features/document-selection/selection";
import { ProcessingView } from "../../src/features/processing/ProcessingView";
import {
  createCase,
  prepareAndStart,
  resumeProcessing,
} from "../../src/core/agent/processor";
import { getApiKey, setApiKey as persistApiKey } from "../../src/core/storage/apiKey";
import {
  getCanonicalAgentResult,
  getCase,
} from "../../src/core/storage/repositories";
import type { ProcessingProgress } from "../../src/core/agent/processor";
import { InitialGuidanceView } from "../../src/features/guidance/InitialGuidanceView";
import { QuickQuestionForm } from "../../src/features/quick-check/QuickQuestionForm";
import { QuickConfirm } from "../../src/features/quick-check/QuickConfirm";
import { Breakdown } from "../../src/features/quick-check/Breakdown";
import {
  SuggestionChips,
  type SuggestionChip,
} from "../../src/features/quick-check/SuggestionChips";
import { evaluateDecision } from "../../src/core/decision/evaluate";
import type { UserAnswer, DecisionResult } from "../../src/core/decision/types";
import type { QuickQuestion } from "../../src/core/decision/types";
import {
  buildGuidanceViewData,
  type GuidanceViewData,
} from "../../src/features/guidance/adapter";
import { SourceRegistry } from "../../src/core/evidence";
import {
  navigateToSource,
  setNavigationRegistry,
} from "../../src/features/source-navigation/navigate";

type PanelState =
  | "DISCOVERY"
  | "SELECTION"
  | "CONSENT_CONFIRM"
  | "PROCESSING"
  | "API_KEY"
  | "GUIDANCE"
  | "QUICK_FORM"
  | "QUICK_CONFIRM"
  | "DECISION";

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

const CURRENT_CASE_KEY = "up2stage_currentCaseId";

function getUserFriendlyError(message: string): string {
  if (message.includes("Receiving end does not exist")) {
    return "현재 탭에서 확장 프로그램이 실행되지 않았어요. http/https 웹페이지에서 다시 열어주세요.";
  }
  return "문서를 불러오지 못했어요. 페이지를 새로고침하고 다시 시도해주세요.";
}

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    void chrome.runtime.openOptionsPage();
  }
}

export function App() {
  const [panel, setPanel] = useState<PanelState>("DISCOVERY");
  const [attachments, setAttachments] = useState<AttachmentPayload[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [autoFocusId, setAutoFocusId] = useState<string | undefined>(undefined);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [guidanceData, setGuidanceData] = useState<GuidanceViewData | null>(null);
  const [questions, setQuestions] = useState<QuickQuestion[]>([]);

  const loadCompletedCase = useCallback(async (caseId: string) => {
    const result = await getCanonicalAgentResult(caseId);
    if (!result) {
      throw new Error("완료된 Agent 결과를 찾지 못했어요.");
    }
    const viewData = buildGuidanceViewData(result);
    if (!viewData) {
      throw new Error("Initial Guidance 결과를 찾지 못했어요.");
    }
    setNavigationRegistry(new SourceRegistry().register(result.sources));
    setGuidanceData(viewData);
    setQuestions(result.quickQuestions);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docs, key, stored] = await Promise.all([
        messaging.discoverAttachments(),
        getApiKey(),
        chrome.storage.session.get(CURRENT_CASE_KEY),
      ]);
      setAttachments(docs);
      setSelectedIds(new Set(docs.map((d) => d.id)));
      setApiKey(key);

      const currentCaseId = stored[CURRENT_CASE_KEY] as string | undefined;
      if (currentCaseId) {
        const caseRecord = await getCase(currentCaseId);
        if (caseRecord) {
          if (caseRecord.status === "processing") {
            setPanel("PROCESSING");
            setProgress({
              caseId: caseRecord.id,
              overall: "processing",
              documents: [],
              message: "진행 중인 분석을 이어 받고 있어요.",
            });
            void resumeProcessing(caseRecord.id, (p) => setProgress(p));
            return;
          }
          if (caseRecord.status === "processed" || caseRecord.status === "failed") {
            if (caseRecord.status === "processed") {
              await loadCompletedCase(caseRecord.id);
              setPanel("GUIDANCE");
              return;
            }
            setPanel("PROCESSING");
            setProgress({
              caseId: caseRecord.id,
              overall: "failed",
              documents: [],
              message: "분석에 실패했어요.",
            });
            return;
          }
        }
      }

      if (!key) {
        setPanel("API_KEY");
      } else {
        setPanel("DISCOVERY");
      }
    } catch (e) {
      const friendly = e instanceof Error ? e.message : "문서를 불러오지 못했어요.";
      setError(getUserFriendlyError(friendly));
      setPanel("DISCOVERY");
    } finally {
      setIsLoading(false);
    }
  }, [loadCompletedCase]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const notifyClosed = () => {
      void chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(([tab]) => {
          if (tab?.id) {
            void chrome.tabs.sendMessage(tab.id, { name: "sidePanelClosed" });
          }
        });
    };
    window.addEventListener("beforeunload", notifyClosed);
    return () => window.removeEventListener("beforeunload", notifyClosed);
  }, []);

  useEffect(() => {
    if (progress?.overall !== "complete") return;
    void loadCompletedCase(progress.caseId)
      .then(() => setPanel("GUIDANCE"))
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? cause.message
            : "완료된 분석 결과를 불러오지 못했어요."
        );
      });
  }, [loadCompletedCase, progress?.caseId, progress?.overall]);

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

  const handleStartAnalysis = useCallback(async () => {
    if (!apiKey) {
      setPanel("API_KEY");
      return;
    }
    setPanel("PROCESSING");
    try {
      const page = await messaging.currentPageContext();
      const caseRecord = await createCase(
        page.url,
        page.title,
        Array.from(selectedIds)
      );
      await chrome.storage.session.set({ [CURRENT_CASE_KEY]: caseRecord.id });
      await prepareAndStart(
        caseRecord,
        selectedDocs,
        (p) => setProgress(p)
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "분석을 시작하지 못했어요.";
      setError(message);
      setPanel("CONSENT_CONFIRM");
    }
  }, [apiKey, selectedIds, selectedDocs]);

  const handleSaveApiKey = useCallback(async () => {
    const key = apiKeyInput.trim();
    if (!key) return;
    await persistApiKey(key);
    setApiKey(key);
    setApiKeyInput("");
    setError(null);
    if (attachments.length > 0) {
      setPanel("DISCOVERY");
    } else {
      void load();
    }
  }, [apiKeyInput, attachments.length, load]);

  const reset = useCallback(() => {
    void chrome.storage.session.remove(CURRENT_CASE_KEY);
    setProgress(null);
    setGuidanceData(null);
    setQuestions([]);
    setPanel("DISCOVERY");
    void load();
  }, [load]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: COLORS.textOnInverse,
        background: COLORS.bgInverse,
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
        <img
          src={chrome.runtime.getURL("logo.png")}
          alt="Up to Stage"
          style={{ height: 60, width: "auto", objectFit: "contain" }}
        />

        <button
          onClick={() => {
            void load();
          }}
          disabled={isLoading}
          aria-label="첨부 문서 다시 찾기"
          style={{
            padding: "8px 12px",
            borderRadius: RADIUS.sm,
            border: `1px solid ${COLORS.textInverseSecondary}`,
            background: "transparent",
            color: isLoading ? COLORS.textInverseSecondary : COLORS.textOnInverse,
            fontSize: 13,
            fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "불러오는 중..." : "↻ 새로고침"}
        </button>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          background: COLORS.bgInverse,
        }}
      >
        {error && (
          <p style={{ margin: 0, color: COLORS.brandLime }}>{getUserFriendlyError(error)}</p>
        )}

        {panel === "API_KEY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
              API Key를 입력해주세요
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textInverseSecondary, margin: 0 }}>
              Upstage AI 사용을 위해 API Key가 필요해요. Key는 이 브라우저 세션 동안만
              메모리에 남습니다.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="up_..."
              style={{
                padding: "12px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${COLORS.textInverseSecondary}`,
                background: COLORS.bgInverseSurface,
                color: COLORS.textOnInverse,
                fontSize: 14,
              }}
            />
            <button
              onClick={() => {
                void handleSaveApiKey();
              }}
              disabled={!apiKeyInput.trim()}
              style={{
                padding: "14px 16px",
                borderRadius: RADIUS.md,
                border: "none",
                background: COLORS.brandLime,
                color: COLORS.textPrimary,
                fontSize: 15,
                fontWeight: 700,
                cursor: apiKeyInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              Key 확인 및 저장
            </button>
            <button
              onClick={() => openOptions()}
              style={{
                padding: "12px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${COLORS.textInverseSecondary}`,
                background: "transparent",
                color: COLORS.textOnInverse,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              설정 페이지에서 입력
            </button>
          </div>
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
              setError(null);
              setAnswers({});
              setDecision(null);
              void handleStartAnalysis();
            }}
            onBack={() => setPanel("SELECTION")}
          />
        )}

        {panel === "PROCESSING" && progress && (
          <ProcessingView progress={progress} onReset={reset} />
        )}

        {panel === "GUIDANCE" && guidanceData && (
          <InitialGuidanceView
            guidance={guidanceData.guidance}
            primaryNotice={guidanceData.primaryNotice}
            {...(guidanceData.applicationForm
              ? { applicationForm: guidanceData.applicationForm }
              : {})}
            {...(guidanceData.procedure
              ? { procedure: guidanceData.procedure }
              : {})}
            checklistCautions={guidanceData.checklistCautions}
            sourceGroups={guidanceData.sourceGroups}
            onQuickCheck={() => setPanel("QUICK_FORM")}
            onMissingClick={() => setPanel("QUICK_FORM")}
            onSourceClick={(sourceId) => {
              void navigateToSource(sourceId).catch((cause: unknown) => {
                setError(cause instanceof Error ? cause.message : "원문을 열지 못했어요.");
              });
            }}
          />
        )}

        {panel === "QUICK_FORM" && (
          <QuickQuestionForm
            questions={questions}
            answers={answers}
            onChange={(questionId, value) =>
              setAnswers((prev) => ({ ...prev, [questionId]: value }))
            }
            onSubmit={() => setPanel("QUICK_CONFIRM")}
            {...(autoFocusId ? { autoFocusId } : {})}
          />
        )}

        {panel === "QUICK_CONFIRM" && (
          <QuickConfirm
            questions={questions}
            answers={answers}
            onBack={() => setPanel("QUICK_FORM")}
            onConfirm={() => {
              const result = evaluateDecision(questions, answers);
              setDecision(result);
              setPanel("DECISION");
            }}
          />
        )}

        {panel === "DECISION" && decision && (
          <Breakdown
            result={decision}
            onMissingClick={(questionId) => {
              setAutoFocusId(questionId);
              setPanel("QUICK_FORM");
            }}
            onSourceClick={(sourceId) => {
              void navigateToSource(sourceId).catch((cause: unknown) => {
                setError(cause instanceof Error ? cause.message : "원문을 열지 못했어요.");
              });
            }}
          />
        )}
      </main>

      {(panel === "GUIDANCE" || panel === "DECISION") && (
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px",
            borderTop: `1px solid ${COLORS.bgInverseSurface}`,
            background: COLORS.bgInverse,
          }}
        >
          <SuggestionChips
            onSelect={(chip: SuggestionChip) => {
              if (chip === "eligibility") {
                setAutoFocusId(undefined);
                setPanel("QUICK_FORM");
              }
            }}
          />
        </div>
      )}
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
            color: COLORS.actionPrimary,
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
        background: COLORS.bgInverseSurface,
        color: COLORS.textOnInverse,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: RADIUS.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: selected ? COLORS.brandLime : "transparent",
            border: selected ? "none" : `1px solid ${COLORS.textInverseSecondary}`,
            flexShrink: 0,
          }}
        >
          {selected && <span style={{ color: COLORS.bgInverse, fontSize: 11 }}>✓</span>}
        </div>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 9999,
            background: COLORS.bgInverse,
            color: COLORS.actionPrimary,
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
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
          background: selected ? COLORS.brandLime : COLORS.bgInverse,
          color: selected ? COLORS.textPrimary : COLORS.textInverseSecondary,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {selected ? "선택됨" : "선택 안 함"}
      </span>
    </div>
  );
}
