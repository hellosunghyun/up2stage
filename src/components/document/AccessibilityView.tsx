import { COLORS } from "../../styles/tokens";
import { navigateToSource } from "../../features/source-navigation/navigate";
import type { SourceRecord } from "../../models/canonical";
import type {
  SourceRegistry,
  ViewerHost,
} from "../../features/source-navigation/navigate";

export interface AccessibilityViewProps {
  sources: SourceRecord[];
  documentId: string;
  sourceRegistry: SourceRegistry;
  viewer: ViewerHost;
}

function SourceItem({
  source,
  sourceRegistry,
  viewer,
}: {
  source: SourceRecord;
  sourceRegistry: SourceRegistry;
  viewer: ViewerHost;
}) {
  const common = {
    margin: 0,
    fontSize: source.category === "heading" ? 16 : 14,
    fontWeight: source.category === "heading" ? 700 : 400,
  } as const;

  const content = (
    <button
      type="button"
      onClick={() =>
        void navigateToSource(source.sourceId, sourceRegistry, viewer)
      }
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        color: COLORS.textPrimary,
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
      }}
    >
      {source.text}
    </button>
  );

  switch (source.category) {
    case "heading":
      return <h2 style={common}>{content}</h2>;
    case "list":
      return <li style={common}>{content}</li>;
    case "table":
      return (
        <div role="cell" style={common}>
          {content}
        </div>
      );
    case "figure":
      return <figure style={common}>{content}</figure>;
    default:
      return <p style={common}>{content}</p>;
  }
}

export function AccessibilityView({
  sources,
  documentId,
  sourceRegistry,
  viewer,
}: AccessibilityViewProps) {
  const filtered = sources.filter((s) => s.documentId === documentId);

  return (
    <article
      aria-label="원문 접근성 보기"
      style={{ padding: 24, lineHeight: 1.7 }}
    >
      <h2 style={{ fontSize: 16, marginBottom: 16 }}>원문 구조</h2>
      <ul
        role="list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {filtered.map((source) => (
          <li key={source.sourceId} role="listitem">
            <SourceItem
              source={source}
              sourceRegistry={sourceRegistry}
              viewer={viewer}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}
