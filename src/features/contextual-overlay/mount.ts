import { createRoot, type Root } from "react-dom/client";
import React from "react";
import { ContextualOverlay } from "./Overlay";

let overlayRoot: Root | null = null;
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

  const container = document.createElement("div");
  container.id = "up2stage-overlay-container";
  hostElement.appendChild(container);

  document.body.appendChild(hostElement);

  overlayRoot = createRoot(container);
  overlayRoot.render(
    React.createElement(ContextualOverlay, { onOpen, onClose })
  );
}

export function unmountOverlay(): void {
  if (overlayRoot) {
    overlayRoot.unmount();
    overlayRoot = null;
  }
  if (hostElement && hostElement.parentNode) {
    hostElement.parentNode.removeChild(hostElement);
    hostElement = null;
  }
}
