import type { ProcessingProgress } from "../../core/agent/processor";
import { COLORS, RADIUS } from "../../styles/tokens";
import { CurrentPageCard, ScreenIntro, type PageSummary } from "../../components/PanelShell";

function statusIcon(status: string): string {
  if (status === "complete" || status === "uploaded") return "✓";
  if (status === "failed" || status === "download_failed" || status === "upload_failed") return "✕";
  if (
    status === "pending" ||
    status === "downloading" ||
    status === "uploading" ||
    status === "analyzing"
  )
    return "◌";
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
    failed: "실패"
  };
  return labels[status] ?? "처리 중";
}

export function ProcessingView({
  progress,
  onReset,
  page
}: {
  progress: ProcessingProgress;
  onReset: () => void;
  page?: PageSummary | null;
}) {
  const { overall, message, documents } = progress;
  const completed = documents.filter(
    (d) => d.processingStatus === "uploaded" || d.processingStatus === "complete"
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        color: COLORS.textOnInverse
      }}
    >
      <CurrentPageCard page={page} />
      <ScreenIntro
        title="문서를 분석하고 있어요"
        description="지원 조건, 필요한 서류, 마감일을 확인하고 있어요."
      />

      <div
        style={{
          padding: "14px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden="true" style={{ color: COLORS.actionPrimary, fontSize: 20 }}>
            ◌
          </span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{message}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: COLORS.brandLime }}>
              {documents.length}개 문서 분석 중
            </p>
          </div>
        </div>
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
          gap: 8
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
              background: COLORS.bgInverseSurface
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                overflow: "hidden"
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>
                {statusIcon(doc.processingStatus)}
              </span>
              <span
                style={{
                  padding: "3px 7px",
                  borderRadius: 999,
                  background: COLORS.actionPrimary,
                  color: COLORS.textOnInverse,
                  fontSize: 9,
                  fontWeight: 700
                }}
              >
                {doc.extension.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {doc.fileName}
              </span>
            </div>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: COLORS.actionPrimary,
                color: COLORS.textOnInverse,
                fontSize: 10,
                flexShrink: 0
              }}
            >
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
              cursor: "pointer"
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

      <div
        style={{
          padding: "14px 16px",
          borderRadius: RADIUS.md,
          background: COLORS.bgInverseSurface,
          fontSize: 11,
          lineHeight: 1.5,
          color: COLORS.textInverseSecondary
        }}
      >
        선택한 문서를 Upstage AI로 분석하고 있어요. 완료되면 결과와 원문 근거를 함께 볼 수 있어요.
      </div>
    </div>
  );
}
