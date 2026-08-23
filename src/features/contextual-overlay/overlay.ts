export interface OverlayOptions {
  onOpen: () => void;
  onClose: () => void;
}

export function createContextualOverlay({
  onOpen,
  onClose,
}: OverlayOptions): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = "up2stage-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Up to Stage 안내");
  overlay.style.all = "initial";
  overlay.style.position = "fixed";
  overlay.style.right = "24px";
  overlay.style.bottom = "24px";
  overlay.style.width = "336px";
  overlay.style.zIndex = "2147483647";
  overlay.style.padding = "20px";
  overlay.style.borderRadius = "12px";
  overlay.style.background = "#111722";
  overlay.style.color = "#ffffff";
  overlay.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.24)";
  overlay.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  overlay.style.boxSizing = "border-box";

  const brand = document.createElement("div");
  brand.textContent = "Up to Stage";
  brand.style.fontWeight = "700";
  brand.style.fontSize = "14px";
  brand.style.marginBottom = "8px";
  brand.style.color = "#ffffff";
  overlay.appendChild(brand);

  const body = document.createElement("p");
  body.innerHTML =
    "이 페이지와 관련된 문서를 확인할 수 있어요.<br/>조건, 마감, 제출서류를 함께 정리합니다.";
  body.style.margin = "0";
  body.style.fontSize = "14px";
  body.style.lineHeight = "1.5";
  body.style.marginBottom = "16px";
  body.style.color = "#ffffff";
  overlay.appendChild(body);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "12px";
  actions.style.justifyContent = "flex-end";
  overlay.appendChild(actions);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "관련 문서 확인하기 →";
  openButton.style.background = "#d2ff95";
  openButton.style.color = "#0a0d14";
  openButton.style.border = "none";
  openButton.style.borderRadius = "8px";
  openButton.style.padding = "8px 12px";
  openButton.style.fontSize = "13px";
  openButton.style.fontWeight = "600";
  openButton.style.cursor = "pointer";
  openButton.addEventListener("click", onOpen);
  actions.appendChild(openButton);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "닫기";
  closeButton.style.background = "transparent";
  closeButton.style.color = "#ffffff";
  closeButton.style.border = "1px solid #8390a5";
  closeButton.style.borderRadius = "8px";
  closeButton.style.padding = "8px 12px";
  closeButton.style.fontSize = "13px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", onClose);
  actions.appendChild(closeButton);

  return overlay;
}
