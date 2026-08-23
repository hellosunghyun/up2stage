import type { QaAnswer } from "./types";
import { COLORS, RADIUS } from "../../styles/tokens";

export interface QaConversationItem {
  id: string;
  question: string;
  result: QaAnswer;
}

export function QaConversation({
  messages,
  sourceLabels,
  onSourceClick,
}: {
  messages: readonly QaConversationItem[];
  sourceLabels: Readonly<Record<string, string>>;
  onSourceClick: (sourceId: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <p style={{ margin: 0, color: COLORS.textInverseSecondary, fontSize: 13 }}>
        문서에 대해 궁금한 것을 물어보세요. 답변의 근거를 원문에서 확인할 수 있어요.
      </p>
    );
  }

  return (
    <div aria-label="문서 질문과 답변" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {messages.map((message) => (
        <article key={message.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p
            style={{
              alignSelf: "flex-end",
              maxWidth: "86%",
              margin: 0,
              padding: "10px 12px",
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {message.question}
          </p>
          <section
            style={{
              padding: 16,
              borderRadius: RADIUS.md,
              borderLeft: `4px solid ${
                message.result.status === "answered" ? COLORS.brandLime : COLORS.warning
              }`,
              background: COLORS.bgInverseSurface,
            }}
          >
            <div style={{ fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-line" }}>
              {message.result.answer}
            </div>
            {message.result.evidenceSourceIds.length > 0 && (
              <div
                aria-label="답변 근거"
                style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
              >
                {message.result.evidenceSourceIds.map((sourceId, index) => (
                  <button
                    key={sourceId}
                    type="button"
                    onClick={() => onSourceClick(sourceId)}
                    style={{
                      padding: "7px 9px",
                      border: "none",
                      borderRadius: RADIUS.sm,
                      background: COLORS.brandLime,
                      color: COLORS.textPrimary,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {index + 1}. {sourceLabels[sourceId] ?? "원문 근거"}
                  </button>
                ))}
              </div>
            )}
            {message.result.missingInformation.length > 0 && (
              <ul
                aria-label="추가 확인 필요"
                style={{ margin: "12px 0 0", paddingLeft: 18, color: COLORS.textInverseSecondary }}
              >
                {message.result.missingInformation.map((item) => (
                  <li key={item} style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {message.result.nextActions.length > 0 && (
              <ol
                aria-label="다음 행동"
                style={{ margin: "12px 0 0", paddingLeft: 20, color: COLORS.textInverseSecondary }}
              >
                {message.result.nextActions.map((item) => (
                  <li key={item} style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </article>
      ))}
    </div>
  );
}
