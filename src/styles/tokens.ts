/**
 * Figma 기반 design token 상수.
 * Side Panel은 어두운 surface + lime accent를 기본으로 통일한다.
 */
export const COLORS = {
  bgCanvas: "#ffffff",
  bgInverse: "#0a0d14",
  bgInverseSurface: "#111722",
  brandLime: "#d2ff95",
  actionPrimary: "#5b52ff",
  textPrimary: "#0a0d14",
  textOnInverse: "#ffffff",
  textInverseSecondary: "#8390a5",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  warning: "#f59e0b",
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
