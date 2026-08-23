import type { Point } from "../../models/source";

export interface EvidenceOverlayProps {
  width: number;
  height: number;
  polygon: Point[];
  number?: number;
}

export function EvidenceOverlay({ width, height, polygon, number }: EvidenceOverlayProps) {
  if (polygon.length < 3) {
    return null;
  }

  const [first] = polygon;
  if (!first) {
    return null;
  }

  const points = polygon.map((p) => `${p.x * width},${p.y * height}`).join(" ");

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <polygon
        points={points}
        fill="rgba(210,255,149,0.42)"
        stroke="#d2ff95"
        strokeWidth={1}
      />
      {number !== undefined && (
        <text
          x={first.x * width + 6}
          y={first.y * height + 14}
          fill="#0a0d14"
          fontSize={11}
          fontWeight={700}
        >
          {number}
        </text>
      )}
    </svg>
  );
}
