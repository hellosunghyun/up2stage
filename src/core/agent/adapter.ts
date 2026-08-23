import { generateId } from "../../utils/id";
import type { AgentJob, OutputItem } from "./types";
import type {
  CanonicalAgentResult,
  Citation,
  DocumentRecord,
  DocumentRole,
  ExtractFieldValue,
  ExtractRecord,
  GuidanceRecord,
  ParseElement,
  QuickQuestionRecord,
  SourceRecord,
  SourceLocation,
} from "../../models/canonical";
import {
  buildExtractLocationMap,
  buildSourceId,
  buildSourcesFromParse,
  resolveInstructCitations,
  SourceRegistry,
  type ExtractLocationMapping,
} from "../evidence";
import {
  dedupeCanonicalQuickQuestions,
  parseCanonicalQuickQuestion,
} from "../decision/questions";

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
    const parsed = JSON.parse(value) as unknown;
    return (typeof parsed === "string" ? JSON.parse(parsed) : parsed) as T;
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
    additionalValues: additional ?? {},
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
    sourceIds: [],
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

interface ExtractDescriptor {
  schemaName: string;
  role: DocumentRole;
  text: string;
  additional: Record<string, unknown> | undefined;
  pageRange: [number, number] | undefined;
}

function getPageRange(
  additional: Record<string, unknown> | undefined
): [number, number] | undefined {
  if (!Array.isArray(additional?.page_ranges)) return undefined;
  const first = (additional.page_ranges as unknown[])[0];
  return Array.isArray(first) && first.length >= 2
    ? [Number(first[0]), Number(first[1])]
    : undefined;
}

function orderDocumentsByParseInput(
  documents: DocumentRecord[],
  parseAdditional: Record<string, unknown> | undefined
): DocumentRecord[] {
  const ids = Array.isArray(parseAdditional?.document_ids)
    ? (parseAdditional.document_ids as unknown[]).filter(
        (value): value is string => typeof value === "string"
      )
    : [];
  if (ids.length === 0) return documents;

  const ordered = ids
    .map((id) => documents.find((document) => document.upstageFileId === id))
    .filter((document): document is DocumentRecord => document !== undefined);
  return [...ordered, ...documents.filter((document) => !ordered.includes(document))];
}

function inferDocumentRanges(
  documents: DocumentRecord[],
  descriptors: readonly ExtractDescriptor[],
  totalPages: number,
  parseAdditional: Record<string, unknown> | undefined
): void {
  const known = descriptors
    .filter(
      (descriptor): descriptor is ExtractDescriptor & { pageRange: [number, number] } =>
        descriptor.pageRange !== undefined
    )
    .sort((a, b) => a.pageRange[0] - b.pageRange[0]);
  if (known.length === 0 || totalPages < 1) return;

  const spans: Array<{
    range: [number, number];
    role: DocumentRole;
  }> = [];
  let cursor = 1;
  for (const descriptor of known) {
    const [start, end] = descriptor.pageRange;
    if (start > cursor) {
      spans.push({ range: [cursor, start - 1], role: "reference_material" });
    }
    spans.push({ range: [start, end], role: descriptor.role });
    cursor = Math.max(cursor, end + 1);
  }
  if (cursor <= totalPages) {
    spans.push({ range: [cursor, totalPages], role: "reference_material" });
  }

  if (spans.length !== documents.length) return;
  const orderedDocuments = orderDocumentsByParseInput(documents, parseAdditional);
  spans.forEach((span, index) => {
    const document = orderedDocuments[index];
    if (!document) return;
    document.pageRange = span.range;
    document.role = span.role;
  });
}

function documentForPage(
  documents: readonly DocumentRecord[],
  page: number
): DocumentRecord | undefined {
  return documents.find((document) => {
    if (!document.pageRange) return false;
    return page >= document.pageRange[0] && page <= document.pageRange[1];
  });
}

function extractAnchor(descriptor: ExtractDescriptor): string | undefined {
  const keys = ["title", "form_title", "document_title", "guide_title"];
  for (const key of keys) {
    const value = descriptor.additional?.[key];
    if (
      value &&
      typeof value === "object" &&
      typeof (value as Record<string, unknown>)._value === "string"
    ) {
      return (value as Record<string, unknown>)._value as string;
    }
  }
  return undefined;
}

function fontSize(source: SourceRecord): number {
  const match = source.html?.match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
  return match ? Number(match[1]) : 0;
}

function assignSourcesToDocuments(
  rawSources: readonly SourceRecord[],
  documents: readonly DocumentRecord[],
  descriptors: readonly ExtractDescriptor[],
  parseAdditional: Record<string, unknown> | undefined
): SourceRecord[] {
  const orderedDocuments = orderDocumentsByParseInput([...documents], parseAdditional);
  const starts = new Map<string, number>();
  const firstDocument = orderedDocuments[0];
  if (firstDocument) starts.set(firstDocument.id, 0);

  for (const descriptor of descriptors) {
    const anchor = extractAnchor(descriptor);
    const page = descriptor.pageRange?.[0];
    const document = page ? documentForPage(orderedDocuments, page) : undefined;
    if (!anchor || !document) continue;
    const index = rawSources.findIndex((source) => source.text.includes(anchor));
    if (index >= 0) starts.set(document.id, index);
  }

  for (let index = 0; index < orderedDocuments.length; index++) {
    const document = orderedDocuments[index];
    if (!document || starts.has(document.id)) continue;
    const previous = [...orderedDocuments]
      .slice(0, index)
      .reverse()
      .find((candidate) => starts.has(candidate.id));
    const next = orderedDocuments
      .slice(index + 1)
      .find((candidate) => starts.has(candidate.id));
    const lower = previous ? (starts.get(previous.id) ?? -1) + 1 : 0;
    const upper = next ? starts.get(next.id) ?? rawSources.length : rawSources.length;
    const candidates = rawSources
      .map((source, sourceIndex) => ({ source, sourceIndex }))
      .filter(({ sourceIndex }) => sourceIndex >= lower && sourceIndex < upper);
    const maximumFontSize = candidates.reduce(
      (maximum, candidate) => Math.max(maximum, fontSize(candidate.source)),
      0
    );
    const boundary = candidates.find(
      (candidate) => fontSize(candidate.source) === maximumFontSize
    );
    if (boundary) starts.set(document.id, boundary.sourceIndex);
  }

  const orderedStarts = orderedDocuments
    .map((document) => ({ document, start: starts.get(document.id) }))
    .filter(
      (entry): entry is { document: DocumentRecord; start: number } =>
        entry.start !== undefined
    )
    .sort((a, b) => a.start - b.start);

  return rawSources.flatMap((source, sourceIndex): SourceRecord[] => {
    const owner = [...orderedStarts]
      .reverse()
      .find((entry) => entry.start <= sourceIndex)?.document;
    if (!owner) return [];
    const pageRange = owner.pageRange;
    const page =
      pageRange && (source.page < pageRange[0] || source.page > pageRange[1])
        ? pageRange[0]
        : source.page;
    const sourceId = buildSourceId(owner.id, page, source.elementId);
    return [
      {
        ...source,
        documentId: owner.id,
        page,
        sourceId,
        semanticNodeId: sourceId,
      },
    ];
  });
}

function sourceToParseElement(source: SourceRecord): ParseElement {
  return {
    id: `pe:${source.sourceId}`,
    caseId: source.caseId,
    documentId: source.documentId,
    sourceId: source.sourceId,
    elementId: source.elementId,
    category: source.category,
    type: categoryToType(source.category),
    page: source.page,
    html: source.html,
    markdown: source.markdown,
    text: source.text,
    coordinates: source.polygon,
    wordCoordinates: source.wordCoordinates,
  };
}

function buildQuickQuestions(
  caseId: string,
  extracts: readonly ExtractRecord[],
  extractMaps: ReadonlyMap<
    string,
    ReadonlyMap<string, ExtractLocationMapping>
  >
): QuickQuestionRecord[] {
  const questions: QuickQuestionRecord[] = [];
  const origins: Array<{
    schemaName: string;
    origin: "primary_notice" | "requirements_checklist";
  }> = [
    { schemaName: "primary_notice_extract", origin: "primary_notice" },
    {
      schemaName: "requirements_checklist_extract",
      origin: "requirements_checklist",
    },
  ];

  for (const { schemaName, origin } of origins) {
    const extract = extracts.find((record) => record.schemaName === schemaName);
    const lines = Array.isArray(extract?.rawJson.quick_questions)
      ? extract.rawJson.quick_questions.filter(
          (value): value is string => typeof value === "string"
        )
      : [];
    const map = extractMaps.get(schemaName);
    lines.forEach((source, index) => {
      questions.push(
        parseCanonicalQuickQuestion({
          caseId,
          source,
          origin,
          index,
          sourceIds: map?.get(`quick_questions[${index}]`)?.sourceIds ?? [],
        })
      );
    });
  }
  return dedupeCanonicalQuickQuestions(questions);
}

export function adaptAgentJob(
  job: AgentJob,
  caseRecord: { id: string },
  documents: DocumentRecord[]
): CanonicalAgentResult {
  const parseItem = job.output.find((o) => o.model === "step_1_parse");
  const parseText = getOutputText(parseItem);
  const parsedParse = parseText ? parseParseOutput(parseText) : undefined;
  const parseAdditional = getAdditionalValues(parseItem);

  const classified: DocumentRecord[] = documents.map((d) => ({ ...d }));
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

  // 2. Extract descriptors establish document page ranges in the actual v0.22 run.
  const extractItems = job.output.filter((o) =>
    o.model.startsWith("Information Extract - ")
  );
  const descriptors: ExtractDescriptor[] = [];
  for (const item of extractItems) {
    const schemaName = item.model.replace("Information Extract - ", "").trim();
    const role = SCHEMA_ROLES[schemaName];
    const text = getOutputText(item);
    const additional = getAdditionalValues(item);
    if (!role || !text) continue;
    descriptors.push({
      schemaName,
      role,
      text,
      additional,
      pageRange: getPageRange(additional),
    });
  }

  const rawSources = parsedParse?.html
    ? buildSourcesFromParse({
        caseId: caseRecord.id,
        documentId: "unassigned",
        html: parsedParse.html,
      })
    : [];
  const totalPages = rawSources.reduce(
    (maximum, source) => Math.max(maximum, source.page),
    0
  );
  inferDocumentRanges(classified, descriptors, totalPages, parseAdditional);

  const sources = assignSourcesToDocuments(
    rawSources,
    classified,
    descriptors,
    parseAdditional
  );

  // 3. Extract records are linked by page range, never by raw component access.
  for (const descriptor of descriptors) {
    const page = descriptor.pageRange?.[0];
    const doc =
      (page ? documentForPage(classified, page) : undefined) ??
      classified.find((document) => document.role === descriptor.role);

    if (doc) {
      doc.role = descriptor.role;
      if (descriptor.pageRange) doc.pageRange = descriptor.pageRange;
      const record = buildExtractRecord(
        caseRecord.id,
        doc.id,
        descriptor.schemaName,
        descriptor.text,
        descriptor.additional
      );
      if (record) {
        extracts.push(record);
      }
    }
  }

  const pageCorrections = new Map<string, { page: number; score: number }>();
  for (const extract of extracts) {
    const firstPass = buildExtractLocationMap(
      sources.filter((source) => source.documentId === extract.documentId),
      extract.additionalValues
    );
    for (const mapping of firstPass.values()) {
      for (const sourceId of mapping.sourceIds) {
        const current = pageCorrections.get(sourceId);
        if (!current || mapping.rawValue.length > current.score) {
          pageCorrections.set(sourceId, {
            page: mapping.page,
            score: mapping.rawValue.length,
          });
        }
      }
    }
  }

  const pageNormalizedSources = sources.map((source): SourceRecord => {
    const page = pageCorrections.get(source.sourceId)?.page ?? source.page;
    const sourceId = buildSourceId(source.documentId, page, source.elementId);
    return {
      ...source,
      page,
      sourceId,
      semanticNodeId: sourceId,
    };
  });
  const registry = new SourceRegistry().register(pageNormalizedSources);
  const extractMaps = new Map<
    string,
    ReturnType<typeof buildExtractLocationMap>
  >();
  for (const extract of extracts) {
    const map = buildExtractLocationMap(
      pageNormalizedSources.filter(
        (source) => source.documentId === extract.documentId
      ),
      extract.additionalValues
    );
    extractMaps.set(extract.schemaName, map);
    for (const mapping of map.values()) {
      for (const sourceId of mapping.sourceIds) {
        registry.mergeLocation(sourceId, mapping);
      }
    }
  }
  const resolvedSources = registry.all();
  const parseElements = resolvedSources.map(sourceToParseElement);

  // 4. Guidance citations resolve only to Source IDs already in the Registry.
  const instructItem = job.output.find((o) => o.model.startsWith("Instruct - "));
  const guidanceText = getOutputText(instructItem);
  const guidance: GuidanceRecord | null =
    guidanceText
      ? buildGuidance(caseRecord.id, guidanceText, getAdditionalValues(instructItem))
      : null;
  if (guidance) {
    const primaryMap = extractMaps.get("primary_notice_extract") ?? new Map();
    const resolutions = resolveInstructCitations(
      guidance.citations.map((citation) => ({
        index: citation.index,
        sourceType: citation.sourceType,
        sourceRef: citation.sourceRef,
        page: citation.page ?? 1,
        coordinates: citation.coordinates ?? [],
        wordCoordinates: citation.wordCoordinates ?? [],
      })),
      primaryMap
    );
    guidance.citations = guidance.citations.map((citation) => ({
      ...citation,
      sourceIds:
        resolutions.find((resolution) => resolution.index === citation.index)
          ?.sourceIds ?? [],
    }));
  }

  const quickQuestions = buildQuickQuestions(caseRecord.id, extracts, extractMaps);

  return {
    caseId: caseRecord.id,
    agentJobId: job.id,
    status: job.status === "failed" ? "failed" : "completed",
    completedAt: Date.now(),
    documents: classified,
    parseElements,
    sources: resolvedSources,
    extracts,
    guidance,
    quickQuestions,
  };
}
