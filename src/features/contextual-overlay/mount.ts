import { createContextualOverlay } from "./overlay";

let hostElement: HTMLElement | null = null;

export interface MountOverlayOptions {
  onOpen: () => void;
  onClose: () => void;
}

export function mountOverlay({ onOpen, onClose }: MountOverlayOptions): void {
  if (hostElement) return;

  hostElement = document.createElement("div");
  hostElement.id = "up2stage-overlay-host";
  hostElement.style.all = "initial";
  hostElement.style.position = "static";

  const overlayElement = createContextualOverlay({ onOpen, onClose });
  hostElement.appendChild(overlayElement);
  document.body.appendChild(hostElement);
}

export function unmountOverlay(): void {
  if (hostElement && hostElement.parentNode) {
    hostElement.parentNode.removeChild(hostElement);
    hostElement = null;
  }
}
