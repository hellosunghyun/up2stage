import { generateId } from "../../utils/id";
import type { AgentJob, OutputItem } from "./types";
import type {
  Citation,
  DocumentRecord,
  DocumentRole,
  ExtractFieldValue,
  ExtractRecord,
  GuidanceRecord,
  ParseElement,
  SourceLocation,
} from "../../models/canonical";

const ROLE_SCHEMAS: Record<DocumentRole, string> = {
  primary_notice: "primary_notice_extract",
  requirements_checklist: "requirements_checklist_extract",
  application_form: "application_form_extract",
  procedure_guide: "procedure_extract",
  amendment_update: "amendment_extract",
  reference_material: "",
  other: "",
};

const SCHEMA_ROLES: Record<string, DocumentRole> = Object.fromEntries(
  (Object.entries(ROLE_SCHEMAS) as [DocumentRole, string][])
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => [v, k])
);

function safeJsonParse<T = unknown>(value: string | undefined): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function getOutputText(item: OutputItem | undefined): string | undefined {
  if (!item) return undefined;
  return item.content.find((c) => c.type === "output_text")?.text;
}

function getAdditionalValues(
  item: OutputItem | undefined
): Record<string, unknown> | undefined {
  if (!item) return undefined;
  const raw = item.content.find((c) => c.type === "output_text")?.additional_values;
  if (raw == null) return undefined;
  if (typeof raw === "string") return safeJsonParse<Record<string, unknown>>(raw);
  return raw as Record<string, unknown>;
}

function toDocumentType(value: string | undefined): DocumentRole | undefined {
  if (!value) return undefined;
  const roles: DocumentRole[] = [
    "primary_notice",
    "requirements_checklist",
    "application_form",
    "procedure_guide",
    "reference_material",
    "amendment_update",
    "other",
  ];
  if (roles.includes(value as DocumentRole)) {
    return value as DocumentRole;
  }
  return undefined;
}

interface ParsedParseResult {
  html?: string | undefined;
  markdown?: string | undefined;
  text?: string | undefined;
  elements?: Array<Record<string, unknown>> | undefined;
}

function parseParseOutput(text: string): ParsedParseResult | undefined {
  const parsed = safeJsonParse<Record<string, unknown>>(text);
  if (!parsed) return undefined;
  const content = parsed.content as Record<string, string | undefined> | undefined;
  return {
    html: content?.html,
    markdown: content?.markdown,
    text: content?.text,
    elements: Array.isArray(parsed.elements)
      ? (parsed.elements as Array<Record<string, unknown>>)
      : undefined,
  };
}

function categoryToType(category: string | undefined):
  | "heading"
  | "paragraph"
  | "list"
  | "table"
  | "figure"
  | "caption"
  | "other" {
  if (!category) return "other";
  if (category.startsWith("heading")) return "heading";
  if (category.includes("list")) return "list";
  if (category.includes("table")) return "table";
  if (category.includes("figure")) return "figure";
  if (category.includes("caption")) return "caption";
  if (category.includes("paragraph")) return "paragraph";
  return "other";
}

function buildParseElements(
  caseId: string,
  documentId: string,
  elements: Array<Record<string, unknown>>
): ParseElement[] {
  return elements.map((el, idx) => {
    const content = (el.content as Record<string, string | undefined> | undefined) ?? {};
    const coords = el.coordinates as Array<{ x: number; y: number }> | undefined;
    const wordCoords = el.word_coordinates as
      | Array<Array<{ x: number; y: number }>>
      | undefined;
    const page = typeof el.page === "number" ? el.page : undefined;
    const id = typeof el.id === "string" ? el.id : String(idx);
    return {
      id: generateId(),
      caseId,
      documentId,
      sourceId: `parse:${documentId}:${page ?? 0}:${id}`,
      type: categoryToType(el.category as string | undefined),
      level: typeof el.level === "number" ? el.level : undefined,
      page,
      html: content.html,
      markdown: content.markdown,
      text: content.text,
      coordinates: coords,
      wordCoordinates: wordCoords,
    };
  });
}

function mapElementToDocument(
  element: ParseElement,
  documents: DocumentRecord[]
): DocumentRecord | undefined {
  if (element.page == null) return documents[0];
  return documents.find((d) => {
    if (d.pageRange == null) return false;
    const start = d.pageRange[0] ?? 0;
    const end = d.pageRange[1] ?? 0;
    return element.page! >= start && element.page! <= end;
  });
}

interface ConfidenceResult {
  score?: number | undefined;
  label?: "high" | "medium" | "low" | undefined;
}

function parseConfidence(value: unknown): ConfidenceResult {
  if (typeof value !== "object" || value == null) return {};
  const v = value as Record<string, unknown>;
  const label =
    typeof v.confidence === "string"
      ? (v.confidence as "high" | "medium" | "low")
      : undefined;
  const score =
    typeof v.confidence_score === "number"
      ? v.confidence_score
      : typeof v.confidence === "number"
        ? v.confidence
        : undefined;
  return { label, score };
}

function parseLocation(value: unknown): SourceLocation | undefined {
  if (typeof value !== "object" || value == null) return undefined;
  const v = value as Record<string, unknown>;
  const coordinates = Array.isArray(v.coordinates)
    ? (v.coordinates as Array<{ x: number; y: number }>)
    : undefined;
  const wordCoordinates = Array.isArray(v.word_coordinates)
    ? (v.word_coordinates as Array<Array<{ x: number; y: number }>>)
    : undefined;
  const page = typeof v.page === "number" ? v.page : undefined;
  if (page == null && !coordinates) return undefined;
  return {
    page: page ?? 0,
    coordinates: coordinates ?? [],
    wordCoordinates,
  };
}

function flattenExtractValues(
  raw: Record<string, unknown>,
  meta: Record<string, unknown> | undefined
): ExtractFieldValue[] {
  const result: ExtractFieldValue[] = [];

  for (const [key, value] of Object.entries(raw)) {
    const metaValue = meta?.[key];

    if (Array.isArray(value) && Array.isArray(metaValue)) {
      value.forEach((item, idx) => {
        const m = metaValue[idx] as unknown;
        const loc = parseLocation(m);
        const conf = parseConfidence(m);
        const itemValue = typeof item === "string" ? item : JSON.stringify(item);
        result.push({
          field: key,
          value: itemValue,
          confidence: conf.label,
          confidenceScore: conf.score,
          page: loc?.page,
          location: loc,
        });
      });
    } else {
      const loc = parseLocation(metaValue);
      const conf = parseConfidence(metaValue);
      let strValue: string;
      if (typeof value === "string") {
        strValue = value;
      } else if (
        typeof metaValue === "object" &&
        metaValue != null &&
        typeof (metaValue as Record<string, unknown>)._value === "string"
      ) {
        strValue = (metaValue as Record<string, unknown>)._value as string;
      } else {
        strValue = JSON.stringify(value);
      }
      result.push({
        field: key,
        value: strValue,
        confidence: conf.label,
        confidenceScore: conf.score,
        page: loc?.page,
        location: loc,
      });
    }
  }

  return result;
}

function buildExtractRecord(
  caseId: string,
  documentId: string,
  schemaName: string,
  text: string,
  additional: Record<string, unknown> | undefined
): ExtractRecord | undefined {
  const raw = safeJsonParse<Record<string, unknown>>(text);
  if (!raw) return undefined;

  const pageRange = Array.isArray(additional?.page_ranges)
    ? (additional?.page_ranges as [number, number][])[0]
    : undefined;

  return {
    id: generateId(),
    caseId,
    documentId,
    schemaName,
    values: flattenExtractValues(raw, additional),
    rawJson: raw,
    pageRange,
  };
}

function buildGuidance(
  caseId: string,
  text: string,
  additional: Record<string, unknown> | undefined
): GuidanceRecord | null {
  const raw = safeJsonParse<Record<string, unknown>>(text);
  if (!raw) return null;

  const rawCitations = Array.isArray(additional?.citations)
    ? (additional?.citations as Array<Record<string, unknown>>)
    : [];

  const citations: Citation[] = rawCitations.map((c, idx) => ({
    index: typeof c.index === "number" ? c.index : idx + 1,
    sourceType: typeof c.source_type === "string" ? c.source_type : "extract",
    sourceRef: typeof c.source_ref === "string" ? c.source_ref : "",
    nodeIndex: typeof c.node_index === "number" ? c.node_index : 0,
    page: typeof c.page === "number" ? c.page : undefined,
    coordinates: Array.isArray(c.coordinates)
      ? (c.coordinates as Array<{ x: number; y: number }>)
      : undefined,
    wordCoordinates: Array.isArray(c.word_coordinates)
      ? (c.word_coordinates as Array<Array<{ x: number; y: number }>>)
      : undefined,
  }));

  return {
    id: generateId(),
    caseId,
    overview: typeof raw.overview === "string" ? raw.overview : "",
    topRequirements: Array.isArray(raw.top_requirements)
      ? (raw.top_requirements as string[])
      : [],
    nearestDeadline: typeof raw.nearest_deadline === "string" ? raw.nearest_deadline : "",
    requiredSubmissions: Array.isArray(raw.required_submissions)
      ? (raw.required_submissions as string[])
      : [],
    topCautions: Array.isArray(raw.top_cautions)
      ? (raw.top_cautions as string[])
      : [],
    nextActions: Array.isArray(raw.next_actions)
      ? (raw.next_actions as string[])
      : [],
    missingInformation: Array.isArray(raw.missing_information)
      ? (raw.missing_information as string[])
      : [],
    personalizationStatus:
      raw.personalization_status === "not_evaluated" ? "not_evaluated" : "not_evaluated",
    citations,
  };
}

export function adaptAgentJob(
  job: AgentJob,
  _caseRecord: { id: string },
  documents: DocumentRecord[]
): { documents: DocumentRecord[]; parseElements: ParseElement[]; extracts: ExtractRecord[]; guidance: GuidanceRecord | null } {
  const parseItem = job.output.find((o) => o.model === "step_1_parse");
  const parseText = getOutputText(parseItem);
  const parsedParse = parseText ? parseParseOutput(parseText) : undefined;

  const classified: DocumentRecord[] = documents.map((d) => ({ ...d }));
  const parseElements: ParseElement[] = [];
  const extracts: ExtractRecord[] = [];

  // 1. Classify
  const classifyItems = job.output.filter((o) => o.model === "step_2_classify");
  for (let i = 0; i < classifyItems.length && i < classified.length; i++) {
    const item = classifyItems[i];
    const doc = classified[i];
    if (!doc) continue;

    const role = toDocumentType(getOutputText(item));
    const additional = getAdditionalValues(item);

    if (role) {
      doc.role = role;
    }
    if (additional) {
      const meta = additional.document_type as Record<string, unknown> | undefined;
      if (meta && typeof meta.confidence_score === "number") {
        doc.roleConfidence = meta.confidence_score;
      }
      if (Array.isArray(additional.page_ranges)) {
        const first = (additional.page_ranges as [number, number][])[0];
        if (first) {
          doc.pageRange = first;
        }
      }
    }
    doc.processingStatus = "uploaded";
  }

  // 2. Parse elements
  if (parsedParse?.elements) {
    const allElements = buildParseElements(
      _caseRecord.id,
      "unknown",
      parsedParse.elements
    );
    for (const el of allElements) {
      const targetDoc = mapElementToDocument(el, classified);
      if (targetDoc) {
        parseElements.push({
          ...el,
          documentId: targetDoc.id,
          sourceId: `parse:${targetDoc.id}:${el.page ?? 0}:${el.sourceId.split(":").pop() ?? ""}`,
        });
      } else if (classified.length > 0) {
        const first = classified[0];
        if (first) {
          parseElements.push({
            ...el,
            documentId: first.id,
            sourceId: `parse:${first.id}:${el.page ?? 0}:${el.sourceId.split(":").pop() ?? ""}`,
          });
        }
      }
    }
  } else if (parsedParse) {
    // If no element list, store the full parse per document as a single element
    for (const doc of classified) {
      parseElements.push({
        id: generateId(),
        caseId: _caseRecord.id,
        documentId: doc.id,
        sourceId: `parse:${doc.id}:full`,
        type: "other",
        html: parsedParse.html,
        markdown: parsedParse.markdown,
        text: parsedParse.text,
      });
    }
  }

  // 3. Extract
  const extractItems = job.output.filter((o) =>
    o.model.startsWith("Information Extract - ")
  );
  const roleDocIndex: Partial<Record<DocumentRole, number>> = {};

  for (const item of extractItems) {
    const schemaName = item.model.replace("Information Extract - ", "").trim();
    const role = SCHEMA_ROLES[schemaName];
    const text = getOutputText(item);
    const additional = getAdditionalValues(item);

    if (!role || !text) continue;

    const roleDocs = classified.filter((d) => d.role === role);
    const idx = roleDocIndex[role] ?? 0;
    const doc = roleDocs[idx];
    roleDocIndex[role] = idx + 1;

    if (doc) {
      const record = buildExtractRecord(
        _caseRecord.id,
        doc.id,
        schemaName,
        text,
        additional
      );
      if (record) {
        extracts.push(record);
      }
    }
  }

  // 4. Guidance
  const instructItem = job.output.find((o) => o.model.startsWith("Instruct - "));
  const guidanceText = getOutputText(instructItem);
  const guidance =
    guidanceText
      ? buildGuidance(_caseRecord.id, guidanceText, getAdditionalValues(instructItem))
      : null;

  return { documents: classified, parseElements, extracts, guidance };
}
