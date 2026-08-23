import { COLORS } from "../../styles/tokens";

export type SuggestionChip =
  | "eligibility"
  | "preparation"
  | "cautions";

interface SuggestionChipsProps {
  onSelect: (chip: SuggestionChip) => void;
}

const CHIPS: { key: SuggestionChip; label: string }[] = [
  { key: "eligibility", label: "나는 신청할 수 있나요?" },
  { key: "preparation", label: "무엇을 준비해야 하나요?" },
  { key: "cautions", label: "주의사항 알려줘" },
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onSelect(chip.key)}
          style={{
            padding: "10px 14px",
            borderRadius: 9999,
            border: `1px solid ${COLORS.textInverseSecondary}`,
            background: "transparent",
            color: COLORS.textOnInverse,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
