import { COLORS, RADIUS } from "../../styles/tokens";
import { ResultCard } from "../../components/ResultCard";
import { stripCitations } from "./helpers";
import { SubmissionChecklist } from "./SubmissionChecklist";
import { CautionList } from "./CautionList";
import { NextActions } from "./NextActions";
import { Timeline } from "./Timeline";
import { ApplicationFormCheck } from "./ApplicationFormCheck";
import { ProcedureSteps } from "./ProcedureSteps";
import type {
  InitialGuidance,
  PrimaryNoticeExtract,
  ApplicationFormExtract,
  ProcedureExtract,
  GuidanceSourceGroups,
} from "./types";

interface InitialGuidanceViewProps {
  guidance: InitialGuidance;
  primaryNotice: PrimaryNoticeExtract;
  applicationForm?: ApplicationFormExtract;
  procedure?: ProcedureExtract;
  checklistCautions?: string[];
  sourceGroups?: GuidanceSourceGroups;
  onQuickCheck: () => void;
  onMissingClick?: (label: string) => void;
  onSourceClick?: (sourceId: string) => void;
}

export function InitialGuidanceView({
  guidance,
  primaryNotice,
  applicationForm,
  procedure,
  checklistCautions = [],
  sourceGroups,
  onQuickCheck,
  onMissingClick,
  onSourceClick,
}: InitialGuidanceViewProps) {
  const overview = stripCitations(guidance.overview);
  const deadline = stripCitations(guidance.nearestDeadline);
  const allSubmissions = [
    ...guidance.requiredSubmissions,
    ...(primaryNotice.conditional_submissions ?? []),
  ];
  const allCautions = [
    ...guidance.topCautions,
    ...primaryNotice.critical_cautions,
    ...checklistCautions,
  ];
  const sourceClickProps = onSourceClick ? { onSourceClick } : {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px",
        minWidth: 360,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: COLORS.brandLime, fontSize: 16 }}>✓</span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>
          문서를 모두 확인했어요
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: COLORS.textOnInverse,
        }}
      >
        {overview}
      </p>

      <ResultCard
        title="주요 조건"
        body={
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {guidance.topRequirements.map((req, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                {stripCitations(req)}
              </li>
            ))}
          </ul>
        }
        accent="lime"
        sourceIds={sourceGroups?.topRequirements}
        {...sourceClickProps}
      />

      <ResultCard
        title="가장 가까운 마감"
        body={
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <span style={{ color: COLORS.brandLime, fontWeight: 700 }}>
              {deadline}
            </span>
          </div>
        }
        accent="warning"
        sourceIds={sourceGroups?.nearestDeadline}
        {...sourceClickProps}
      />

      <ResultCard
        title="필수 제출물"
        body={<SubmissionChecklist items={allSubmissions} />}
        accent="neutral"
        sourceIds={sourceGroups?.requiredSubmissions}
        {...sourceClickProps}
      />

      {primaryNotice.key_dates.length > 2 && (
        <ResultCard
          title="일정"
          body={<Timeline items={primaryNotice.key_dates} />}
          accent="neutral"
          sourceIds={sourceGroups?.keyDates}
          {...sourceClickProps}
        />
      )}

      <ResultCard
        title="놓치면 안 되는 것"
        body={<CautionList items={allCautions} />}
        accent="warning"
        sourceIds={sourceGroups?.topCautions}
        {...sourceClickProps}
      />

      {applicationForm && (
        <ResultCard
          title={`${applicationForm.form_title} 작성 전 확인`}
          body={<ApplicationFormCheck extract={applicationForm} />}
          accent="neutral"
          sourceIds={sourceGroups?.applicationForm}
          {...sourceClickProps}
        />
      )}

      {procedure && (
        <ResultCard
          title={procedure.guide_title}
          body={<ProcedureSteps extract={procedure} />}
          accent="neutral"
          sourceIds={sourceGroups?.procedure}
          {...sourceClickProps}
        />
      )}

      <ResultCard
        title="지금 해야 할 일"
        body={<NextActions items={guidance.nextActions} />}
        accent="lime"
        sourceIds={sourceGroups?.nextActions}
        {...sourceClickProps}
      />

      {guidance.missingInformation.length > 0 && (
        <ResultCard
          title="확인 필요"
          body={
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 18px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {guidance.missingInformation.map((info, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: COLORS.textOnInverse,
                  }}
                >
                  {stripCitations(info)}{" "}
                  {onMissingClick && (
                    <button
                      onClick={() => onMissingClick(stripCitations(info))}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: COLORS.brandLime,
                        cursor: "pointer",
                        fontSize: 13,
                        padding: 0,
                      }}
                    >
                      [입력하기]
                    </button>
                  )}
                </li>
              ))}
            </ul>
          }
          accent="warning"
          {...sourceClickProps}
        />
      )}

      <button
        onClick={onQuickCheck}
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          border: "none",
          background: COLORS.brandLime,
          color: COLORS.textPrimary,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
        }}
      >
        내 조건 확인하기 →
      </button>
    </div>
  );
}
