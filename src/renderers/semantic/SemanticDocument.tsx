import { Fragment, type KeyboardEvent } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";
import type { SemanticRenderNode, SemanticTableRow } from "./types";

export interface SemanticDocumentProps {
  nodes: readonly SemanticRenderNode[];
  documentLabel: string;
  activeNodeId?: string | undefined;
  onNodeFocus?: ((sourceId: string) => void) | undefined;
  onNodeActivate?: ((sourceId: string) => void) | undefined;
  onEscape?: (() => void) | undefined;
}

const focusableStyle = {
  borderRadius: RADIUS.sm,
  outline: "none",
  scrollMargin: 32
} as const;

function sourceProps(
  node: SemanticRenderNode,
  activeNodeId: string | undefined,
  onFocus: ((sourceId: string) => void) | undefined,
  onActivate: ((sourceId: string) => void) | undefined,
  onEscape: (() => void) | undefined
) {
  return {
    id: `semantic-${node.id}`,
    "data-semantic-node-id": node.id,
    "data-source-id": node.sourceId,
    tabIndex: 0,
    onFocus: () => onFocus?.(node.sourceId),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onActivate?.(node.sourceId);
      } else if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
      }
    },
    style: {
      ...focusableStyle,
      boxShadow: activeNodeId === node.id ? `0 0 0 3px ${COLORS.brandLime}` : undefined
    }
  } as const;
}

function TableRows({ rows }: { rows: readonly SemanticTableRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.id}>
          {row.cells.map((cell) => {
            const Cell = cell.header ? "th" : "td";
            return (
              <Cell
                key={cell.id}
                {...(cell.scope ? { scope: cell.scope } : {})}
                {...(cell.colSpan ? { colSpan: cell.colSpan } : {})}
                {...(cell.rowSpan ? { rowSpan: cell.rowSpan } : {})}
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  textAlign: "left",
                  verticalAlign: "top",
                  background: cell.header ? COLORS.bgSurface : COLORS.bgCanvas
                }}
              >
                {cell.text}
              </Cell>
            );
          })}
        </tr>
      ))}
    </>
  );
}

function SemanticTable({ node }: { node: SemanticRenderNode }) {
  const rows = node.tableRows ?? [];
  const head = rows.filter((row) => row.section === "head");
  const body = rows.filter((row) => row.section === "body");
  const foot = rows.filter((row) => row.section === "foot");

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        {node.tableCaption && <caption style={{ textAlign: "left", marginBottom: 8 }}>{node.tableCaption}</caption>}
        {head.length > 0 && <thead><TableRows rows={head} /></thead>}
        <tbody>
          <TableRows rows={body.length > 0 || head.length > 0 || foot.length > 0 ? body : rows} />
        </tbody>
        {foot.length > 0 && <tfoot><TableRows rows={foot} /></tfoot>}
      </table>
      {rows.length === 0 && <p>{node.text}</p>}
    </div>
  );
}

function SemanticContent({
  node,
  activeNodeId,
  onNodeFocus,
  onNodeActivate,
  onEscape
}: {
  node: SemanticRenderNode;
  activeNodeId?: string | undefined;
  onNodeFocus?: ((sourceId: string) => void) | undefined;
  onNodeActivate?: ((sourceId: string) => void) | undefined;
  onEscape?: (() => void) | undefined;
}) {
  switch (node.type) {
    case "heading": {
      const level = Math.min(6, Math.max(1, node.level ?? 2));
      const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Heading style={{ margin: "24px 0 10px", lineHeight: 1.35 }}>{node.text}</Heading>;
    }
    case "paragraph":
      return <p style={{ margin: "8px 0", lineHeight: 1.75 }}>{node.text}</p>;
    case "ordered-list":
    case "unordered-list": {
      const List = node.type === "ordered-list" ? "ol" : "ul";
      return (
        <List style={{ margin: "10px 0", paddingInlineStart: 28, lineHeight: 1.7 }}>
          {(node.listItems ?? []).map((item) => <li key={item.id}>{item.text}</li>)}
        </List>
      );
    }
    case "table":
      return <SemanticTable node={node} />;
    case "figure":
      return (
        <figure style={{ margin: "20px 0", padding: 16, background: COLORS.bgSurface, borderRadius: RADIUS.md }}>
          <p style={{ margin: 0 }}>{node.text}</p>
          {node.children?.map((child) => (
            <figcaption
              key={child.id}
              {...sourceProps(child, activeNodeId, onNodeFocus, onNodeActivate, onEscape)}
              style={{
                ...sourceProps(child, activeNodeId, onNodeFocus, onNodeActivate, onEscape).style,
                marginTop: 8,
                color: COLORS.textSecondary
              }}
            >
              {child.text}
            </figcaption>
          ))}
        </figure>
      );
    case "caption":
      return <p style={{ margin: "8px 0", color: COLORS.textSecondary }}>{node.text}</p>;
  }
}

export function SemanticDocument({
  nodes,
  documentLabel,
  activeNodeId,
  onNodeFocus,
  onNodeActivate,
  onEscape
}: SemanticDocumentProps) {
  return (
    <article aria-label={`${documentLabel} 원문 접근성 보기`} style={{ maxWidth: 760, margin: "0 auto", padding: "24px 32px 64px" }}>
      {nodes.length === 0 ? (
        <p role="status">이 문서에서 접근성 구조를 찾지 못했어요.</p>
      ) : (
        nodes.map((node) => (
          <Fragment key={node.id}>
            <div {...sourceProps(node, activeNodeId, onNodeFocus, onNodeActivate, onEscape)}>
              <SemanticContent
                node={node}
                activeNodeId={activeNodeId}
                onNodeFocus={onNodeFocus}
                onNodeActivate={onNodeActivate}
                onEscape={onEscape}
              />
            </div>
          </Fragment>
        ))
      )}
    </article>
  );
}
