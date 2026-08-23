import type { ProcessingProgress } from "../../core/agent/processor";
import { COLORS, RADIUS } from "../../styles/tokens";

function statusIcon(status: string): string {
  if (status === "complete" || status === "uploaded") return "✓";
  if (status === "failed" || status === "download_failed" || status === "upload_failed") return "✕";
  if (status === "pending" || status === "downloading" || status === "uploading" || status === "analyzing") return "◌";
  return "·";
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "대기 중",
    downloading: "다운로드 중",
    download_failed: "다운로드 실패",
    uploading: "업로드 중",
    upload_failed: "업로드 실패",
    uploaded: "업로드 완료",
    analyzing: "분석 중",
    complete: "완료",
    processed: "완료",
    failed: "실패",
  };
  return labels[status] ?? "처리 중";
}

export function ProcessingView({
  progress,
  onReset,
}: {
  progress: ProcessingProgress;
  onReset: () => void;
}) {
  const { overall, message, documents } = progress;
  const completed = documents.filter(
    (d) =>
      d.processingStatus === "uploaded" ||
      d.processingStatus === "complete"
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: COLORS.textOnInverse,
      }}
    >
      <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>문서를 분석하고 있어요</h2>
      <p style={{ fontSize: 14, color: COLORS.textInverseSecondary, margin: 0 }}>
        문서의 역할과 핵심 정보를 정리합니다.
      </p>

      <div
        style={{
          padding: "14px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{message}</p>
        {overall === "preparing" && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: COLORS.textInverseSecondary }}>
            {completed} / {documents.length} 문서 준비 완료
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px",
              borderRadius: RADIUS.md,
              background: COLORS.bgInverseSurface,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{statusIcon(doc.processingStatus)}</span>
              <span
                style={{
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.fileName}
              </span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.textInverseSecondary, flexShrink: 0 }}>
              {statusLabel(doc.processingStatus)}
            </span>
          </div>
        ))}
      </div>

      {overall === "failed" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onReset}
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
            처음으로
          </button>
        </div>
      )}

      {overall === "complete" && (
        <p style={{ fontSize: 13, color: COLORS.brandLime, margin: 0 }}>
          분석이 완료되었어요. 다음 단계가 준비되면 안내드릴게요.
        </p>
      )}

      <p style={{ fontSize: 12, color: COLORS.textInverseSecondary, margin: 0 }}>
        문서 종류와 분량에 따라 시간이 걸릴 수 있어요.
      </p>
    </div>
  );
}
