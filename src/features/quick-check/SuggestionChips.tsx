import { COLORS, RADIUS } from "../../styles/tokens";

export type SuggestionChip = "eligibility" | "preparation" | "cautions";

interface SuggestionChipsProps {
  onSelect: (chip: SuggestionChip) => void;
  disabled?: boolean;
}

const CHIPS: { key: SuggestionChip; label: string }[] = [
  { key: "eligibility", label: "나는 신청할 수 있나요?" },
  { key: "preparation", label: "무엇을 준비해야 하나요?" },
  { key: "cautions", label: "주의사항 알려줘" }
];

export function SuggestionChips({ onSelect, disabled = false }: SuggestionChipsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onSelect(chip.key)}
          disabled={disabled}
          title={disabled ? "후속 질문 기능은 준비 중입니다" : undefined}
          style={{
            padding: "9px 12px",
            borderRadius: RADIUS.sm,
            border: "none",
            background: COLORS.bgInverseSurface,
            color: COLORS.actionPrimary,
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.7 : 1,
            whiteSpace: "nowrap"
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
