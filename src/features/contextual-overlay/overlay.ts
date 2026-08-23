export interface OverlayOptions {
  onOpen: () => void;
  onClose: () => void;
}

function getExtensionUrl(path: string): string {
  return chrome.runtime.getURL(path);
}

function createCombinedBrandImage(): SVGSVGElement {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 150 32");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Up to Stage");
  svg.style.height = "32px";
  svg.style.width = "auto";
  svg.style.display = "block";

  const symbol = document.createElementNS(svgNs, "image");
  symbol.setAttribute("x", "0");
  symbol.setAttribute("y", "0");
  symbol.setAttribute("width", "32");
  symbol.setAttribute("height", "32");
  symbol.setAttribute("href", getExtensionUrl("icons/icon-32.png"));
  symbol.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.appendChild(symbol);

  const logo = document.createElementNS(svgNs, "image");
  logo.setAttribute("x", "40");
  logo.setAttribute("y", "4");
  logo.setAttribute("width", "110");
  logo.setAttribute("height", "24");
  logo.setAttribute("href", getExtensionUrl("logo.png"));
  logo.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.appendChild(logo);

  return svg;
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

  const brand = createCombinedBrandImage();
  overlay.appendChild(brand);

  return overlay;
}
