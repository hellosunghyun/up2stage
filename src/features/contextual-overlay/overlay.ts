export interface OverlayOptions {
  onOpen: () => void;
  onClose: () => void;
}

function getExtensionUrl(path: string): string {
  return chrome.runtime.getURL(path);
}

function createBrandImage(): HTMLImageElement {
  const img = document.createElement("img");
  img.src = getExtensionUrl("logo.png");
  img.alt = "";
  img.style.height = "32px";
  img.style.width = "auto";
  img.style.display = "block";
  return img;
}

export function createContextualOverlay({
  onOpen,
}: OverlayOptions): HTMLElement {
  const overlay = document.createElement("button");
  overlay.type = "button";
  overlay.id = "up2stage-overlay";
  overlay.setAttribute("aria-label", "Up to Stage 안내 열기");
  overlay.style.all = "initial";
  overlay.style.position = "fixed";
  overlay.style.right = "24px";
  overlay.style.bottom = "24px";
  overlay.style.zIndex = "2147483647";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.gap = "0";
  overlay.style.padding = "8px 16px";
  overlay.style.border = "none";
  overlay.style.borderRadius = "9999px";
  overlay.style.background = "#111722";
  overlay.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.24)";
  overlay.style.cursor = "pointer";
  overlay.style.boxSizing = "border-box";
  overlay.addEventListener("click", onOpen);

  const brand = createBrandImage();
  overlay.appendChild(brand);

  return overlay;
}
