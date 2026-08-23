import { COLORS } from "../../styles/tokens";
import { stripCitations } from "./helpers";

interface CautionListProps {
  items: string[];
}

export function CautionList({ items }: CautionListProps) {
  const unique = Array.from(new Set(items.map(stripCitations)));
  return (
    <ul
      style={{
        margin: 0,
        padding: "0 0 0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {unique.map((item, index) => (
        <li
          key={index}
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: COLORS.textOnInverse,
          }}
        >
          <span style={{ color: COLORS.warning, marginRight: 6 }}>⚠</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
