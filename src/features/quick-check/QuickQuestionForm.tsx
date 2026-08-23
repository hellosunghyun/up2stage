import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { COLORS, RADIUS } from "../../styles/tokens";
import type { QuickQuestion, UserAnswer } from "../../core/decision/types";

interface QuickQuestionFormProps {
  questions: QuickQuestion[];
  answers: Record<string, UserAnswer>;
  onChange: (questionId: string, answer: UserAnswer) => void;
  onSubmit: () => void;
  autoFocusId?: string;
}

function toDisplayValue(answer: UserAnswer): string {
  if (answer === null) return "";
  if (typeof answer === "boolean") return answer ? "true" : "false";
  return String(answer);
}

function QuestionInput({
  question,
  answer,
  onChange,
  inputRef,
}: {
  question: QuickQuestion;
  answer: UserAnswer;
  onChange: (value: UserAnswer) => void;
  inputRef: (el: HTMLInputElement | HTMLSelectElement | null) => void;
}) {
  const commonStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: RADIUS.sm,
    border: `1px solid ${COLORS.textInverseSecondary}`,
    background: COLORS.bgInverse,
    color: COLORS.textOnInverse,
    fontSize: 14,
    boxSizing: "border-box",
  };

  switch (question.inputType) {
    case "text":
    case "organization_select":
      return (
        <input
          ref={inputRef}
          type="text"
          value={toDisplayValue(answer)}
          onChange={(e) => onChange(e.target.value)}
          style={commonStyle}
        />
      );
    case "number":
      return (
        <input
          ref={inputRef}
          type="number"
          value={answer === null ? "" : String(answer)}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isNaN(n) ? null : n);
          }}
          style={commonStyle}
        />
      );
    case "select":
      return (
        <select
          ref={inputRef}
          value={toDisplayValue(answer)}
          onChange={(e) => onChange(e.target.value)}
          style={commonStyle}
        >
          <option value="">선택하세요</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "boolean":
      return <BooleanControl value={answer === null ? null : answer === true} onChange={onChange} />;
    case "date":
      return (
        <input
          ref={inputRef}
          type="date"
          value={answer === null ? "" : String(answer)}
          onChange={(e) => onChange(e.target.value)}
          style={commonStyle}
        />
      );
    default:
      return (
        <input
          ref={inputRef}
          type="text"
          value={toDisplayValue(answer)}
          onChange={(e) => onChange(e.target.value)}
          style={commonStyle}
        />
      );
  }
}

function BooleanControl({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: UserAnswer) => void;
}) {
  const optionStyle = (selected: boolean): CSSProperties => ({
    flex: 1,
    padding: "10px",
    borderRadius: RADIUS.sm,
    border: `1px solid ${COLORS.textInverseSecondary}`,
    background: selected ? COLORS.brandLime : "transparent",
    color: selected ? COLORS.textPrimary : COLORS.textOnInverse,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center",
  });
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => onChange(true)}
        style={optionStyle(value === true)}
      >
        예
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        style={optionStyle(value === false)}
      >
        아니오
      </button>
    </div>
  );
}

export function QuickQuestionForm({
  questions,
  answers,
  onChange,
  onSubmit,
  autoFocusId,
}: QuickQuestionFormProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  useEffect(() => {
    if (autoFocusId && refs.current[autoFocusId]) {
      refs.current[autoFocusId]?.focus();
    }
  }, [autoFocusId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q) => {
        const value = answers[q.id] ?? null;
        const isOpen = expanded[q.id] ?? false;
        return (
          <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.textOnInverse,
                }}
              >
                {q.label}
              </label>
              {q.required ? (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: COLORS.brandLime,
                    color: COLORS.textPrimary,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  필수
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    color: COLORS.textInverseSecondary,
                  }}
                >
                  모르면 비워도 돼요
                </span>
              )}
            </div>

            <QuestionInput
              question={q}
              answer={value}
              onChange={(v) => onChange(q.id, v)}
              inputRef={(el) => {
                refs.current[q.id] = el ?? null;
              }}
            />

            {q.ruleText && q.ruleText.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [q.id]: !isOpen }))
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: COLORS.textInverseSecondary,
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  왜 묻나요? {isOpen ? "▲" : "▼"}
                </button>
                {isOpen && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: COLORS.textInverseSecondary,
                    }}
                  >
                    {q.ruleText}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          border: "none",
          background: COLORS.brandLime,
          color: COLORS.textPrimary,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
        }}
      >
        입력 완료
      </button>
    </form>
  );
}
