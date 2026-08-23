import type { SemanticNode } from "../../models/canonical";

export interface SemanticListItem {
  id: string;
  text: string;
}

export type SemanticTableSection = "head" | "body" | "foot";
export type SemanticTableScope = "col" | "row" | "colgroup" | "rowgroup";

export interface SemanticTableCell {
  id: string;
  text: string;
  header: boolean;
  scope?: SemanticTableScope | undefined;
  colSpan?: number | undefined;
  rowSpan?: number | undefined;
}

export interface SemanticTableRow {
  id: string;
  section: SemanticTableSection;
  cells: SemanticTableCell[];
}

/**
 * Canonical SemanticNode를 렌더링에 필요한 구조 정보로만 확장한다.
 * Source ID와 node ID는 기존 Source Registry 계약을 그대로 사용한다.
 */
export interface SemanticRenderNode extends SemanticNode {
  children?: SemanticRenderNode[] | undefined;
  listItems?: SemanticListItem[] | undefined;
  tableCaption?: string | undefined;
  tableRows?: SemanticTableRow[] | undefined;
}
