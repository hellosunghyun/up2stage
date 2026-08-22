import { defineContentScript } from "wxt/utils/define-content-script";
import { messaging } from "../src/core/messaging/protocol";
import { findMatchingRule } from "../src/features/contextual-overlay/rules";
import { mountOverlay, unmountOverlay } from "../src/features/contextual-overlay/mount";
import { discoverAttachments } from "../src/features/discovery/discover";

declare global {
  interface Window {
    __up2stageInjected?: boolean;
  }
}

messaging.onCurrentPageContext(() => {
  return {
    url: window.location.href,
    title: document.title,
  };
});

messaging.onDiscoverAttachments(() => {
  return discoverAttachments();
});

function checkAndRenderOverlay() {
  const url = new URL(window.location.href);
  const matched = findMatchingRule(url);

  if (matched) {
    mountOverlay({
      onOpen: () => {
        void messaging.openSidePanel({});
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
  matches: ["http://*/*", "https://*/*"],
  main() {
    if (window.__up2stageInjected) {
      return;
    }
    window.__up2stageInjected = true;
    console.log("up to stage content script loaded");
    checkAndRenderOverlay();
  },
});
