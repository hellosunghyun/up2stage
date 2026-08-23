import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  messaging,
  type AttachmentPayload,
  type PageContext
} from "../../src/core/messaging/protocol";
import { canStartAnalysis, getSelected } from "../../src/features/document-selection/selection";
import { ProcessingView } from "../../src/features/processing/ProcessingView";
import { createCase, prepareAndStart, resumeProcessing } from "../../src/core/agent/processor";
import { getApiKey, setApiKey as persistApiKey } from "../../src/core/storage/apiKey";
import {
  getCanonicalAgentResult,
  getCase,
  updateCase
} from "../../src/core/storage/repositories";
import type { ProcessingProgress } from "../../src/core/agent/processor";
import { InitialGuidanceView } from "../../src/features/guidance/InitialGuidanceView";
import { QuickQuestionForm } from "../../src/features/quick-check/QuickQuestionForm";
import { QuickConfirm } from "../../src/features/quick-check/QuickConfirm";
import { Breakdown } from "../../src/features/quick-check/Breakdown";
import {
  SuggestionChips,
  type SuggestionChip
} from "../../src/features/quick-check/SuggestionChips";
import { evaluateDecision } from "../../src/core/decision/evaluate";
import type { UserAnswer, DecisionResult } from "../../src/core/decision/types";
import type { QuickQuestion } from "../../src/core/decision/types";
import type { CanonicalAgentResult } from "../../src/models/canonical";
import { buildGuidanceViewData, type GuidanceViewData } from "../../src/features/guidance/adapter";
import { SourceRegistry } from "../../src/core/evidence";
import {
  navigateToSource,
  setNavigationRegistry
} from "../../src/features/source-navigation/navigate";
import { COLORS, RADIUS } from "../../src/styles/tokens";
import {
  ChatComposer,
  PanelFooter,
  PanelHeader,
  PanelShell,
  ScreenIntro
} from "../../src/components/PanelShell";
import {
  QaConversation,
  runQaPipeline,
  type CachedFactGroup,
  type QaConversationItem
} from "../../src/features/qa";
import { generateId } from "../../src/utils/id";

type PanelState =
  | "DISCOVERY"
  | "SELECTION"
  | "CONSENT_CONFIRM"
  | "PROCESSING"
  | "API_KEY"
  | "GUIDANCE"
  | "QUICK_FORM"
  | "QUICK_CONFIRM"
  | "DECISION"
  | "QA";

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
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [agentResult, setAgentResult] = useState<CanonicalAgentResult | null>(null);
  const [qaInput, setQaInput] = useState("");
  const [qaMessages, setQaMessages] = useState<QaConversationItem[]>([]);
  const [qaPending, setQaPending] = useState(false);

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
    setAgentResult(result);
    setGuidanceData(viewData);
    setQuestions(result.quickQuestions);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docs, page, key, stored] = await Promise.all([
        messaging.discoverAttachments(),
        messaging.currentPageContext().catch(() => null),
        getApiKey(),
        chrome.storage.session.get(CURRENT_CASE_KEY)
      ]);
      setAttachments(docs);
      setSelectedIds(new Set(docs.map((d) => d.id)));
      setApiKey(key);
      setPageContext(page);

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
              message: "진행 중인 분석을 이어 받고 있어요."
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
              message: "분석에 실패했어요."
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
      void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
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
        setError(cause instanceof Error ? cause.message : "완료된 분석 결과를 불러오지 못했어요.");
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
    setSelectedIds(value ? new Set(attachments.map((a) => a.id)) : new Set());
  };

  const handleStartAnalysis = useCallback(async () => {
    if (!apiKey) {
      setPanel("API_KEY");
      return;
    }
    setPanel("PROCESSING");
    try {
      const page = pageContext ?? (await messaging.currentPageContext());
      const caseRecord = await createCase(page.url, page.title, Array.from(selectedIds));
      await chrome.storage.session.set({ [CURRENT_CASE_KEY]: caseRecord.id });
      await prepareAndStart(caseRecord, selectedDocs, (p) => setProgress(p));
    } catch (e) {
      const message = e instanceof Error ? e.message : "분석을 시작하지 못했어요.";
      setError(message);
      setPanel("CONSENT_CONFIRM");
    }
  }, [apiKey, pageContext, selectedIds, selectedDocs]);

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
    setAgentResult(null);
    setQuestions([]);
    setQaInput("");
    setQaMessages([]);
    setPanel("DISCOVERY");
    void load();
  }, [load]);

  const cachedFacts = useMemo<CachedFactGroup[]>(() => {
    if (!guidanceData) return [];
    return [
      {
        kind: "schedule",
        values: guidanceData.guidance.nearestDeadline
          ? [guidanceData.guidance.nearestDeadline]
          : [],
        sourceIds: guidanceData.sourceGroups.nearestDeadline
      },
      {
        kind: "submissions",
        values: guidanceData.guidance.requiredSubmissions,
        sourceIds: guidanceData.sourceGroups.requiredSubmissions
      },
      {
        kind: "cautions",
        values: guidanceData.guidance.topCautions,
        sourceIds: guidanceData.sourceGroups.topCautions
      },
      {
        kind: "actions",
        values: guidanceData.guidance.nextActions,
        sourceIds: guidanceData.sourceGroups.nextActions
      }
    ];
  }, [guidanceData]);

  const askQuestion = useCallback(
    async (question: string) => {
      const normalized = question.trim();
      if (!normalized || !agentResult || !apiKey || qaPending) return;
      setQaPending(true);
      setQaInput("");
      setPanel("QA");
      setError(null);
      try {
        const caseRecord = await getCase(agentResult.caseId);
        const result = await runQaPipeline({
          apiKey,
          result: agentResult,
          question: normalized,
          cachedFacts,
          ...(caseRecord?.vectorStoreId
            ? { vectorStoreId: caseRecord.vectorStoreId }
            : {}),
          onVectorStoreCreated: async (vectorStoreId) => {
            await updateCase(agentResult.caseId, { vectorStoreId });
          }
        });
        setQaMessages((messages) => [
          ...messages,
          { id: generateId(), question: normalized, result }
        ]);
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : "질문에 답하지 못했어요.");
      } finally {
        setQaPending(false);
      }
    },
    [agentResult, apiKey, cachedFacts, qaPending]
  );

  return (
    <PanelShell
      header={
        <PanelHeader loading={isLoading} onRefresh={() => void load()} onMenu={openOptions} />
      }
      footer={
        panel === "GUIDANCE" || panel === "DECISION" || panel === "QA" ? (
          <PanelFooter>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SuggestionChips
                onSelect={(chip: SuggestionChip) => {
                  if (chip === "eligibility") {
                    setAutoFocusId(undefined);
                    setPanel("QUICK_FORM");
                  } else if (chip === "preparation") {
                    void askQuestion("무엇을 준비해야 하나요?");
                  } else {
                    void askQuestion("주의사항을 알려줘");
                  }
                }}
                disabled={qaPending}
              />
              <ChatComposer
                value={qaInput}
                onChange={setQaInput}
                onSubmit={() => void askQuestion(qaInput)}
                disabled={!agentResult}
                busy={qaPending}
              />
            </div>
          </PanelFooter>
        ) : undefined
      }
    >
      {error && <p style={{ margin: 0, color: COLORS.brandLime }}>{getUserFriendlyError(error)}</p>}

      {panel === "API_KEY" && (
        <ApiKeySetup
          value={apiKeyInput}
          onChange={setApiKeyInput}
          onSubmit={() => void handleSaveApiKey()}
          onHelp={openOptions}
        />
      )}

      {panel === "DISCOVERY" && (
        <DiscoveryView attachments={attachments} onStart={() => setPanel("SELECTION")} />
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
        <ProcessingView progress={progress} onReset={reset} page={pageContext} />
      )}

      {panel === "GUIDANCE" && guidanceData && (
        <InitialGuidanceView
          guidance={guidanceData.guidance}
          primaryNotice={guidanceData.primaryNotice}
          {...(guidanceData.applicationForm
            ? { applicationForm: guidanceData.applicationForm }
            : {})}
          {...(guidanceData.procedure ? { procedure: guidanceData.procedure } : {})}
          checklistCautions={guidanceData.checklistCautions}
          sourceGroups={guidanceData.sourceGroups}
          sourceLabels={guidanceData.sourceLabels}
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
          onChange={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
          onSubmit={() => setPanel("QUICK_CONFIRM")}
          sourceLabels={guidanceData?.sourceLabels}
          onSourceClick={(sourceId) => {
            void navigateToSource(sourceId).catch((cause: unknown) => {
              setError(cause instanceof Error ? cause.message : "원문을 열지 못했어요.");
            });
          }}
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
          page={pageContext}
          sourceLabels={guidanceData?.sourceLabels}
          {...(guidanceData
            ? {
                guidance: {
                  nearestDeadline: guidanceData.guidance.nearestDeadline,
                  requiredSubmissions: guidanceData.guidance.requiredSubmissions,
                  nextActions: guidanceData.guidance.nextActions
                }
              }
            : {})}
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

      {panel === "QA" && guidanceData && (
        <QaConversation
          messages={qaMessages}
          sourceLabels={guidanceData.sourceLabels}
          onSourceClick={(sourceId) => {
            void navigateToSource(sourceId).catch((cause: unknown) => {
              setError(cause instanceof Error ? cause.message : "원문을 열지 못했어요.");
            });
          }}
        />
      )}
    </PanelShell>
  );
}

export function ApiKeySetup({
  value,
  onChange,
  onSubmit,
  onHelp
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHelp: () => void;
}) {
  const canSubmit = value.trim().length > 0;
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28
      }}
    >
      <ScreenIntro
        title="Upstage를 연결해 주세요"
        description="선택한 문서를 분석할 수 있도록 API Key를 입력해 주세요. Key는 현재 브라우저 세션에만 보관됩니다."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="upstage-api-key" style={{ fontSize: 12, fontWeight: 700 }}>
          API Key
        </label>
        <input
          id="upstage-api-key"
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Upstage API Key를 붙여넣어 주세요"
          style={{
            height: 52,
            padding: "0 14px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.bgInverseSurface}`,
            background: COLORS.bgInverseSurface,
            color: COLORS.textOnInverse,
            fontSize: 13
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onHelp} style={helpButtonStyle}>
          <span style={{ color: COLORS.brandLime }}>?</span> API Key는 어디서 찾나요?
        </button>
        <button type="button" onClick={onHelp} style={helpButtonStyle}>
          <span style={{ color: COLORS.brandLime }}>ⓘ</span> 이 키를 입력하면 무엇이 연결되나요?
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          border: "none",
          background: canSubmit ? COLORS.brandLime : COLORS.bgInverseSurface,
          color: canSubmit ? COLORS.textPrimary : COLORS.textInverseSecondary,
          fontSize: 15,
          fontWeight: 700,
          cursor: canSubmit ? "pointer" : "not-allowed"
        }}
      >
        연결하기
      </button>
    </div>
  );
}

const helpButtonStyle = {
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  background: "rgba(255,255,255,0.06)",
  color: COLORS.textOnInverse,
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 13,
  cursor: "pointer"
} as const;

export function DiscoveryView({
  attachments,
  onStart
}: {
  attachments: AttachmentPayload[];
  onStart: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28
      }}
    >
      <ScreenIntro
        title="복잡한 공고 문서, 바로 정리해볼까요?"
        description="직접 열어볼 필요 없이 자격요건과 주요 일정을 한곳에 모아 보여드려요."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <DiscoveryAction
          label="이 페이지의 문서찾기"
          meta={
            attachments.length > 0
              ? `${attachments.length}개 문서를 찾았어요`
              : "지원하는 첨부 문서를 찾지 못했어요"
          }
          onClick={onStart}
          disabled={attachments.length === 0}
          primary
        />
        <DiscoveryAction
          label="이 페이지에 대해 질문하기"
          meta="문서 분석 후 사용할 수 있어요"
          disabled
        />
        <DiscoveryAction
          label="원문 근거와 함께 확인하기"
          meta="문서 분석 후 사용할 수 있어요"
          disabled
        />
      </div>
    </div>
  );
}

function DiscoveryAction({
  label,
  meta,
  onClick,
  disabled = false,
  primary = false
}: {
  label: string;
  meta: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "14px 16px",
        borderRadius: RADIUS.md,
        border: primary ? `1px solid ${COLORS.brandLime}` : `1px solid ${COLORS.bgInverseSurface}`,
        background: COLORS.bgInverseSurface,
        color: disabled ? COLORS.textInverseSecondary : COLORS.textOnInverse,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left"
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <span
        style={{
          fontSize: 10,
          color: primary ? COLORS.brandLime : COLORS.textInverseSecondary,
          whiteSpace: "nowrap"
        }}
      >
        {meta}
      </span>
    </button>
  );
}

export function SelectionView({
  attachments,
  selectedIds,
  onToggle,
  onSelectAll,
  onNext,
  onBack
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          padding: 0,
          border: "none",
          background: "transparent",
          color: COLORS.textInverseSecondary,
          fontSize: 12,
          cursor: "pointer"
        }}
      >
        ← 이 페이지의 문서찾기
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16
        }}
      >
        <ScreenIntro
          eyebrow={`${selectedCount}개 선택됨`}
          title="분석할 문서를 선택해 주세요"
          description="이 공고와 관련된 문서를 고르면 지원 조건과 마감 정보를 원문 근거와 함께 정리해 드려요."
        />
        <button
          onClick={() => onSelectAll(!allSelected)}
          style={{
            fontSize: 13,
            color: COLORS.actionPrimary,
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>

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

      <div
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          display: "flex",
          alignItems: "flex-start",
          gap: 10
        }}
      >
        <span style={{ color: COLORS.actionPrimary }}>ⓘ</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <strong style={{ fontSize: 12 }}>선택한 문서는 Upstage AI로 분석돼요.</strong>
          <span style={{ fontSize: 11, color: COLORS.textInverseSecondary }}>
            결과는 원문 근거와 함께 확인할 수 있어요.
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onNext}
          disabled={selectedCount === 0}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: "none",
            background: selectedCount === 0 ? COLORS.bgInverseSurface : COLORS.brandLime,
            color: selectedCount === 0 ? COLORS.textInverseSecondary : COLORS.textPrimary,
            fontSize: 15,
            fontWeight: 700,
            cursor: selectedCount === 0 ? "not-allowed" : "pointer"
          }}
        >
          분석하기
        </button>
      </div>
    </div>
  );
}

export function ConsentView({
  selectedDocs,
  canStart,
  consentChecked,
  onToggleConsent,
  onStart,
  onBack
}: {
  selectedDocs: AttachmentPayload[];
  canStart: boolean;
  consentChecked: boolean;
  onToggleConsent: () => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ScreenIntro
        title="선택한 문서를 확인해 주세요"
        description="분석을 시작하기 전에 Upstage AI로 전송할 문서를 한 번 더 확인해 주세요."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selectedDocs.map((a) => (
          <DocChip key={a.id} doc={a} />
        ))}
      </div>

      <div
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          fontSize: 12,
          lineHeight: 1.6,
          color: COLORS.textInverseSecondary
        }}
      >
        선택한 문서는 Upstage를 통해 처리되며, 분석 결과에는 원문으로 돌아갈 수 있는 근거가 함께
        제공됩니다.
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer"
        }}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={onToggleConsent}
          style={{ marginTop: 2 }}
        />
        <span style={{ fontSize: 13, lineHeight: 1.5, color: COLORS.textOnInverse }}>
          위 문서를 AI 처리에 사용하는 데 동의합니다.
          <small style={{ display: "block", marginTop: 3, color: COLORS.textInverseSecondary }}>
            동의하지 않으면 분석을 시작하지 않습니다.
          </small>
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
            cursor: "pointer"
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
            cursor: canStart ? "pointer" : "not-allowed"
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
        color: COLORS.textOnInverse
      }}
    >
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 9999,
          background: COLORS.bgInverse,
          color: COLORS.actionPrimary,
          fontSize: 10,
          fontWeight: 700
        }}
      >
        {doc.extension?.toUpperCase() ?? "FILE"}
      </span>
      <span
        style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {doc.fileName}
      </span>
    </div>
  );
}

function DocSelectRow({
  doc,
  selected,
  onToggle
}: {
  doc: AttachmentPayload;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
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
        border: selected ? `1px solid ${COLORS.bgInverseSurface}` : `1px solid transparent`,
        width: "100%",
        textAlign: "left"
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
            flexShrink: 0
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
            flexShrink: 0
          }}
        >
          {doc.extension?.toUpperCase() ?? "FILE"}
        </span>
        <span
          style={{
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
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
          flexShrink: 0
        }}
      >
        {selected ? "선택됨" : "선택 안 함"}
      </span>
    </button>
  );
}
