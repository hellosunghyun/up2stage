import type { DocumentRecord } from "../../models/document";

export interface DocumentSelectorProps {
  documents: DocumentRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DocumentSelector({
  documents,
  selectedId,
  onSelect,
}: DocumentSelectorProps) {
  const selected = documents.find((d) => d.id === selectedId);
  const currentIndex = documents.findIndex((d) => d.id === selectedId);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 13,
        color: "#0a0d14",
      }}
    >
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
          color: "#0a0d14",
          fontSize: 13,
          minWidth: 160,
        }}
        aria-label="문서 선택"
      >
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.fileName}
          </option>
        ))}
      </select>
      <span style={{ color: "#8390a5" }}>
        {selected ? `${currentIndex + 1} / ${documents.length}` : ""}
      </span>
    </div>
  );
}
