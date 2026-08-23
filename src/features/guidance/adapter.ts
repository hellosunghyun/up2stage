import type {
  CanonicalAgentResult,
  ExtractRecord,
} from "../../models/canonical";
import {
  buildExtractLocationMap,
  collectSourceIdsFromText,
  type CitationResolution,
} from "../../core/evidence";
import type {
  ApplicationFormExtract,
  GuidanceSourceGroups,
  InitialGuidance,
  PrimaryNoticeExtract,
  ProcedureExtract,
} from "./types";

export interface GuidanceViewData {
  guidance: InitialGuidance;
  primaryNotice: PrimaryNoticeExtract;
  applicationForm: ApplicationFormExtract | undefined;
  procedure: ProcedureExtract | undefined;
  checklistCautions: string[];
  sourceGroups: GuidanceSourceGroups;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function extractBySchema(
  result: CanonicalAgentResult,
  schemaName: string
): ExtractRecord | undefined {
  return result.extracts.find((extract) => extract.schemaName === schemaName);
}

function sourceIdsForPrefix(
  result: CanonicalAgentResult,
  extract: ExtractRecord | undefined,
  prefix: string
): string[] {
  if (!extract) return [];
  const map = buildExtractLocationMap(
    result.sources.filter((source) => source.documentId === extract.documentId),
    extract.additionalValues
  );
  const ids = new Set<string>();
  for (const [path, mapping] of map) {
    if (path === prefix || path.startsWith(`${prefix}[`) || path.startsWith(`${prefix}.`)) {
      mapping.sourceIds.forEach((sourceId) => ids.add(sourceId));
    }
  }
  return [...ids];
}

function guidanceSourceIds(
  value: string | readonly string[],
  resolutions: readonly CitationResolution[]
): string[] {
  const values = typeof value === "string" ? [value] : value;
  return [...new Set(values.flatMap((item) => collectSourceIdsFromText(item, resolutions)))];
}

export function buildGuidanceViewData(
  result: CanonicalAgentResult
): GuidanceViewData | undefined {
  const record = result.guidance;
  if (!record) return undefined;

  const primary = extractBySchema(result, "primary_notice_extract");
  const checklist = extractBySchema(result, "requirements_checklist_extract");
  const application = extractBySchema(result, "application_form_extract");
  const procedure = extractBySchema(result, "procedure_extract");
  const resolutions: CitationResolution[] = record.citations.map((citation) => ({
    index: citation.index,
    sourceIds: citation.sourceIds,
    unresolved: citation.sourceIds.length === 0,
  }));

  const guidance: InitialGuidance = {
    overview: record.overview,
    topRequirements: record.topRequirements,
    nearestDeadline: record.nearestDeadline,
    requiredSubmissions: record.requiredSubmissions,
    topCautions: record.topCautions,
    nextActions: record.nextActions,
    missingInformation: record.missingInformation,
    personalizationStatus: record.personalizationStatus,
  };

  const primaryRaw = primary?.rawJson ?? {};
  const primaryNotice: PrimaryNoticeExtract = {
    title: text(primaryRaw.title),
    issuer: text(primaryRaw.issuer),
    benefits_or_outcomes: strings(primaryRaw.benefits_or_outcomes),
    key_dates: strings(primaryRaw.key_dates),
    key_requirements: strings(primaryRaw.key_requirements),
    required_submissions: strings(primaryRaw.required_submissions),
    conditional_submissions: strings(primaryRaw.conditional_submissions),
    quick_questions: strings(primaryRaw.quick_questions),
    critical_cautions: strings(primaryRaw.critical_cautions),
    next_actions_seed: strings(primaryRaw.next_actions_seed),
    contacts: strings(primaryRaw.contacts),
  };

  const applicationRaw = application?.rawJson;
  const applicationForm: ApplicationFormExtract | undefined = applicationRaw
    ? {
        form_title: text(applicationRaw.form_title),
        form_type: text(applicationRaw.form_type),
        required_fields: strings(applicationRaw.required_fields),
        required_signatures: strings(applicationRaw.required_signatures),
        required_attachments: strings(applicationRaw.required_attachments),
        format_constraints: strings(applicationRaw.format_constraints),
        form_cautions: strings(applicationRaw.form_cautions),
      }
    : undefined;

  const procedureRaw = procedure?.rawJson;
  const procedureData: ProcedureExtract | undefined = procedureRaw
    ? {
        guide_title: text(procedureRaw.guide_title),
        steps: strings(procedureRaw.steps),
        channels: strings(procedureRaw.channels),
        file_rules: strings(procedureRaw.file_rules),
        completion_checks: strings(procedureRaw.completion_checks),
        procedure_cautions: strings(procedureRaw.procedure_cautions),
      }
    : undefined;

  return {
    guidance,
    primaryNotice,
    applicationForm,
    procedure: procedureData,
    checklistCautions: strings(checklist?.rawJson.cautions),
    sourceGroups: {
      overview: guidanceSourceIds(record.overview, resolutions),
      topRequirements: guidanceSourceIds(record.topRequirements, resolutions),
      nearestDeadline: guidanceSourceIds(record.nearestDeadline, resolutions),
      requiredSubmissions: guidanceSourceIds(record.requiredSubmissions, resolutions),
      topCautions: guidanceSourceIds(record.topCautions, resolutions),
      nextActions: guidanceSourceIds(record.nextActions, resolutions),
      keyDates: sourceIdsForPrefix(result, primary, "key_dates"),
      applicationForm: [
        ...sourceIdsForPrefix(result, application, "required_fields"),
        ...sourceIdsForPrefix(result, application, "format_constraints"),
        ...sourceIdsForPrefix(result, application, "form_cautions"),
      ],
      procedure: [
        ...sourceIdsForPrefix(result, procedure, "steps"),
        ...sourceIdsForPrefix(result, procedure, "completion_checks"),
        ...sourceIdsForPrefix(result, procedure, "procedure_cautions"),
      ],
    },
  };
}
