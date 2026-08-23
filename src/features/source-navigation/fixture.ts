import * as XLSX from "xlsx";
import type { DocumentRecord } from "../../models/document";
import type { SourceRecord } from "../../models/source";
import type { SourceRegistry } from "./navigate";

export const fixtureDocuments: DocumentRecord[] = [
  {
    id: "doc_sample_pdf",
    caseId: "case_demo",
    fileName: "공고문.pdf",
    extension: "pdf",
    contentHash: "sha256-pdf",
    renderType: "pdf",
    createdAt: Date.now(),
  },
  {
    id: "doc_sample_hwp",
    caseId: "case_demo",
    fileName: "신청서.hwp",
    extension: "hwp",
    contentHash: "sha256-hwp",
    renderType: "hwp",
    createdAt: Date.now(),
  },
  {
    id: "doc_sample_xlsx",
    caseId: "case_demo",
    fileName: "점수표.xlsx",
    extension: "xlsx",
    contentHash: "sha256-xlsx",
    renderType: "xlsx",
    createdAt: Date.now(),
  },
];

export const fixtureSources: SourceRecord[] = [
  {
    sourceId: "src:doc_sample_pdf:p1:e1",
    caseId: "case_demo",
    documentId: "doc_sample_pdf",
    page: 1,
    elementId: "1",
    category: "heading",
    text: "2026년 하반기 서울인재대학장학금 장학생 선발 공고",
    semanticNodeId: "src:doc_sample_pdf:p1:e1",
    polygon: [
      { x: 0.1, y: 0.05 },
      { x: 0.9, y: 0.05 },
      { x: 0.9, y: 0.12 },
      { x: 0.1, y: 0.12 },
    ],
  },
  {
    sourceId: "src:doc_sample_pdf:p1:e2",
    caseId: "case_demo",
    documentId: "doc_sample_pdf",
    page: 1,
    elementId: "2",
    category: "paragraph",
    text: "지원대상: 대한민국 국적자로, 다음의 요건을 모두 충족하는 대학생",
    semanticNodeId: "src:doc_sample_pdf:p1:e2",
    polygon: [
      { x: 0.1, y: 0.2 },
      { x: 0.9, y: 0.2 },
      { x: 0.9, y: 0.26 },
      { x: 0.1, y: 0.26 },
    ],
  },
  {
    sourceId: "src:doc_sample_pdf:p1:e3",
    caseId: "case_demo",
    documentId: "doc_sample_pdf",
    page: 1,
    elementId: "3",
    category: "list",
    text: "학자금 지원구간 4구간 이하인 자",
    semanticNodeId: "src:doc_sample_pdf:p1:e3",
    polygon: [
      { x: 0.15, y: 0.3 },
      { x: 0.7, y: 0.3 },
      { x: 0.7, y: 0.34 },
      { x: 0.15, y: 0.34 },
    ],
  },
  {
    sourceId: "src:doc_sample_hwp:p1:e1",
    caseId: "case_demo",
    documentId: "doc_sample_hwp",
    page: 1,
    elementId: "1",
    category: "heading",
    text: "자기소개서",
    semanticNodeId: "src:doc_sample_hwp:p1:e1",
  },
  {
    sourceId: "src:doc_sample_xlsx:p1:e1",
    caseId: "case_demo",
    documentId: "doc_sample_xlsx",
    page: 1,
    elementId: "1:1",
    category: "table",
    text: "90",
    semanticNodeId: "src:doc_sample_xlsx:p1:e1",
  },
];

function createXlsxFixtureBytes(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["구분", "점수"],
    ["A", "90"],
    ["B", "85"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const written = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  }) as number[];
  return new Uint8Array(written).buffer;
}

export const fixtureBytes = new Map<string, ArrayBuffer>([
  ["doc_sample_pdf", new ArrayBuffer(0)],
  ["doc_sample_hwp", new ArrayBuffer(0)],
  ["doc_sample_xlsx", createXlsxFixtureBytes()],
]);

export function findFixtureSource(sourceId: string): SourceRecord | undefined {
  return fixtureSources.find((s) => s.sourceId === sourceId);
}

export function findFixtureDocument(documentId: string): DocumentRecord | undefined {
  return fixtureDocuments.find((d) => d.id === documentId);
}

export const fixtureSourceRegistry: SourceRegistry = {
  get(sourceId: string): Promise<SourceRecord | undefined> {
    return Promise.resolve(findFixtureSource(sourceId));
  },
};
