export interface SourceBadgeProps {
  number: number;
}

export function SourceBadge({ number }: SourceBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 10,
        background: "#d2ff95",
        color: "#0a0d14",
        fontSize: 11,
        fontWeight: 700,
      }}
      aria-label={`근거 ${number}`}
    >
      {number}
    </span>
  );
}
