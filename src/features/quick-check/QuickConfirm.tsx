import { useState } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";
import type { QuickQuestion, UserAnswer } from "../../core/decision/types";

interface QuickConfirmProps {
  questions: QuickQuestion[];
  answers: Record<string, UserAnswer>;
  onConfirm: () => void;
  onBack: () => void;
}

function formatAnswer(answer: UserAnswer): string {
  if (answer === null) return "미입력";
  if (typeof answer === "boolean") return answer ? "예" : "아니오";
  return String(answer);
}

export function QuickConfirm({
  questions,
  answers,
  onConfirm,
  onBack,
}: QuickConfirmProps) {
  const [consent, setConsent] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: COLORS.textOnInverse,
          margin: 0,
        }}
      >
        입력한 내용을 확인해주세요.
      </h2>

      <div
        style={{
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {questions.map((q) => (
          <div
            key={q.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <span style={{ color: COLORS.textInverseSecondary }}>
              {q.label}
            </span>
            <span
              style={{
                color: COLORS.textOnInverse,
                fontWeight: 600,
              }}
            >
              {formatAnswer(answers[q.id] ?? null)}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "12px",
          borderRadius: RADIUS.sm,
          background: "rgba(91,82,255,0.08)",
          fontSize: 13,
          color: COLORS.textOnInverse,
        }}
      >
        🛡 이 정보는 지원 조건 확인에 사용됩니다.
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          fontSize: 13,
          color: COLORS.textOnInverse,
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2 }}
        />
        위 정보를 분석에 사용하는 데 동의합니다.
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.textInverseSecondary}`,
            background: "transparent",
            color: COLORS.textOnInverse,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          이전
        </button>
        <button
          onClick={onConfirm}
          disabled={!consent}
          style={{
            flex: 2,
            padding: "14px 16px",
            borderRadius: RADIUS.md,
            border: "none",
            background: consent ? COLORS.brandLime : COLORS.bgInverseSurface,
            color: consent ? COLORS.textPrimary : COLORS.textInverseSecondary,
            fontSize: 15,
            fontWeight: 700,
            cursor: consent ? "pointer" : "not-allowed",
          }}
        >
          이 조건으로 확인하기
        </button>
      </div>
    </div>
  );
}
