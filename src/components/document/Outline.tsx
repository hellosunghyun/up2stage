import { COLORS, RADIUS } from "../../styles/tokens";
import type { SourceRecord } from "../../models/canonical";
import { navigateToSource } from "../../features/source-navigation/navigate";
import type { SourceRegistry, ViewerHost } from "../../features/source-navigation/navigate";

function categoryMarker(category: string): string {
  const map: Record<string, string> = {
    heading: "H1",
    paragraph: "P",
    list: "L",
    table: "T",
    figure: "F",
  };
  return map[category] ?? category.slice(0, 1).toUpperCase();
}

export interface OutlineProps {
  sources: SourceRecord[];
  documentId: string;
  selectedSourceId: string | undefined;
  sourceRegistry: SourceRegistry;
  viewer: ViewerHost;
}

export function Outline({
  sources,
  documentId,
  selectedSourceId,
  sourceRegistry,
  viewer,
}: OutlineProps) {
  const filtered = sources.filter((s) => s.documentId === documentId);

  return (
    <nav
      aria-label="문서 목차"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {filtered.map((source) => {
        const isSelected = source.sourceId === selectedSourceId;
        return (
          <button
            key={source.sourceId}
            type="button"
            onClick={() =>
              void navigateToSource(source.sourceId, sourceRegistry, viewer)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 10px",
              border: "none",
              borderRadius: RADIUS.sm,
              background: isSelected ? COLORS.bgInverseSurface : "transparent",
              color: isSelected ? COLORS.brandLime : COLORS.textOnInverse,
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                width: 24,
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.textInverseSecondary,
                flexShrink: 0,
              }}
            >
              {categoryMarker(source.category)}
            </span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {source.text}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
