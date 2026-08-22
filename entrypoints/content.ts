import { defineContentScript } from "wxt/utils/define-content-script";
import { messaging } from "../src/core/messaging/protocol";
import { findMatchingRule } from "../src/features/contextual-overlay/rules";
import { mountOverlay, unmountOverlay } from "../src/features/contextual-overlay/mount";

function checkAndRenderOverlay() {
  const url = new URL(window.location.href);
  const matched = findMatchingRule(url);

  if (matched) {
    mountOverlay({
      onOpen: async () => {
        await messaging.openSidePanel({});
      },
      onClose: () => {
        unmountOverlay();
      },
    });
  } else {
    unmountOverlay();
  }
}

export default defineContentScript({
  matches: ["*://*.example.org/*"],
  main() {
    console.log("up to stage content script loaded");
    checkAndRenderOverlay();
  },
});
