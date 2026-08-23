import { useState } from "react";
import { ScreenIntro } from "../../components/PanelShell";
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

export function QuickConfirm({ questions, answers, onConfirm, onBack }: QuickConfirmProps) {
  const [consent, setConsent] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          padding: 0,
          border: "none",
          background: "transparent",
          color: COLORS.textInverseSecondary,
          fontSize: 12,
          cursor: "pointer"
        }}
      >
        ← 입력 정보 수정하기
      </button>

      <ScreenIntro
        title="입력한 정보를 확인해 주세요"
        description="지원 가능성을 분석하기 전에 사용할 정보를 한 번 보여드릴게요."
      />

      <section
        style={{
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        <div>
          <strong style={{ fontSize: 14 }}>분석에 사용할 정보</strong>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11,
              color: COLORS.textInverseSecondary
            }}
          >
            공고문 조건과 아래 정보를 대조해 결과를 만들어요.
          </p>
        </div>
        {questions.map((question) => (
          <div
            key={question.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              fontSize: 13
            }}
          >
            <span style={{ color: COLORS.textInverseSecondary }}>{question.label}</span>
            <strong style={{ color: COLORS.textOnInverse, textAlign: "right" }}>
              {formatAnswer(answers[question.id] ?? null)}
            </strong>
          </div>
        ))}
      </section>

      <div
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          display: "flex",
          alignItems: "flex-start",
          gap: 10
        }}
      >
        <span aria-hidden="true" style={{ color: COLORS.brandLime }}>
          ◇
        </span>
        <div>
          <strong style={{ fontSize: 12 }}>정보 사용을 확인했어요</strong>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 11,
              lineHeight: 1.5,
              color: COLORS.textInverseSecondary
            }}
          >
            입력 정보와 선택한 문서는 Upstage AI가 이 공고를 분석할 때만 사용해요.
          </p>
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          fontSize: 12,
          lineHeight: 1.5,
          color: COLORS.textOnInverse
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          style={{ marginTop: 2 }}
        />
        <span>
          위 정보를 분석에 사용하는 것에 동의합니다.
          <small style={{ display: "block", color: COLORS.textInverseSecondary }}>
            동의하지 않으면 이전 단계에서 정보를 수정할 수 있어요.
          </small>
        </span>
      </label>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!consent}
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          border: "none",
          background: consent ? COLORS.brandLime : COLORS.bgInverseSurface,
          color: consent ? COLORS.textPrimary : COLORS.textInverseSecondary,
          fontSize: 15,
          fontWeight: 700,
          cursor: consent ? "pointer" : "not-allowed",
          width: "100%"
        }}
      >
        이 정보로 분석 시작하기
      </button>

      <p style={{ margin: 0, fontSize: 10, color: COLORS.textInverseSecondary }}>
        개인정보는 이 공고의 지원 가능성 판단을 위해서만 사용됩니다.
      </p>
    </div>
  );
}
