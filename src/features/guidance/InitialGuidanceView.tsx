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
  GuidanceSourceGroups
} from "./types";

interface InitialGuidanceViewProps {
  guidance: InitialGuidance;
  primaryNotice: PrimaryNoticeExtract;
  applicationForm?: ApplicationFormExtract;
  procedure?: ProcedureExtract;
  checklistCautions?: string[];
  sourceGroups?: GuidanceSourceGroups;
  sourceLabels?: Record<string, string>;
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
  sourceLabels,
  onQuickCheck,
  onMissingClick,
  onSourceClick
}: InitialGuidanceViewProps) {
  const overview = stripCitations(guidance.overview);
  const deadline = stripCitations(guidance.nearestDeadline);
  const allSubmissions = [
    ...guidance.requiredSubmissions,
    ...(primaryNotice.conditional_submissions ?? [])
  ];
  const allCautions = [
    ...guidance.topCautions,
    ...primaryNotice.critical_cautions,
    ...checklistCautions
  ];
  const sourceClickProps = {
    ...(onSourceClick ? { onSourceClick } : {}),
    ...(sourceLabels ? { sourceLabels } : {})
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: COLORS.brandLime,
            color: COLORS.textPrimary,
            fontSize: 14,
            fontWeight: 700
          }}
        >
          ✓
        </span>
        <span style={{ fontSize: 21, fontWeight: 700 }}>문서를 모두 확인했어요</span>
      </div>
      <p
        style={{
          margin: 0,
          paddingLeft: 34,
          fontSize: 12,
          lineHeight: 1.5,
          color: COLORS.textInverseSecondary
        }}
      >
        {overview}
      </p>

      <ResultCard
        title="주요 지원 조건"
        body={
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}
          >
            {guidance.topRequirements.map((requirement, index) => (
              <li key={index}>{stripCitations(requirement)}</li>
            ))}
          </ul>
        }
        accent="lime"
        sourceIds={sourceGroups?.topRequirements}
        {...sourceClickProps}
      />

      <ResultCard
        title="가장 가까운 마감"
        body={<span>{deadline}</span>}
        accent="lime"
        sourceIds={sourceGroups?.nearestDeadline}
        {...sourceClickProps}
      />

      <ResultCard
        title={`필수 제출서류 ${allSubmissions.length}개`}
        body={<SubmissionChecklist items={allSubmissions} />}
        accent="neutral"
        sourceIds={sourceGroups?.requiredSubmissions}
        {...sourceClickProps}
      />

      <section
        style={{
          padding: "16px",
          borderRadius: RADIUS.md,
          borderLeft: `4px solid ${COLORS.brandLime}`,
          background: COLORS.bgInverseSurface,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        <strong style={{ fontSize: 17 }}>내가 지원할 수 있는지도 확인할까요?</strong>
        <span style={{ fontSize: 12, color: COLORS.textInverseSecondary }}>
          학교·학년·지원구간·성적 정보를 입력하면 돼요.
        </span>
        <button
          type="button"
          onClick={onQuickCheck}
          style={{
            marginTop: 4,
            padding: "14px 16px",
            borderRadius: RADIUS.sm,
            border: "none",
            background: COLORS.brandLime,
            color: COLORS.textPrimary,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%"
          }}
        >
          내 조건 확인하기 →
        </button>
      </section>

      <details style={{ marginTop: 4, color: COLORS.textInverseSecondary }}>
        <summary style={{ fontSize: 12, cursor: "pointer" }}>추가 안내 보기</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
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
                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                  {guidance.missingInformation.map((information, index) => (
                    <li key={index} style={{ lineHeight: 1.5 }}>
                      {stripCitations(information)}{" "}
                      {onMissingClick && (
                        <button
                          type="button"
                          onClick={() => onMissingClick(stripCitations(information))}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: COLORS.brandLime,
                            cursor: "pointer",
                            fontSize: 12,
                            padding: 0
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
        </div>
      </details>
    </div>
  );
}
