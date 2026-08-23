import { defineContentScript } from "wxt/utils/define-content-script";
import { messaging } from "../src/core/messaging/protocol";
import { findMatchingRule } from "../src/features/contextual-overlay/rules";
import { mountOverlay, unmountOverlay } from "../src/features/contextual-overlay/mount";
import { discoverAttachments } from "../src/features/discovery/discover";

type ContentMessageListener = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => boolean;

declare global {
  interface Window {
    __up2stageMessageListener?: ContentMessageListener;
  }
}

function getMessageName(message: unknown): string | undefined {
  if (message && typeof message === "object" && "name" in message) {
    const value = message.name;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function setupMessageHandler() {
  if (window.__up2stageMessageListener) {
    chrome.runtime.onMessage.removeListener(window.__up2stageMessageListener);
  }

  const listener: ContentMessageListener = (message, _sender, sendResponse) => {
    const name = getMessageName(message);
    console.log("[up2stage:content] onMessage:", name, message);

    if (name === "currentPageContext") {
      void Promise.resolve({
        url: window.location.href,
        title: document.title,
      }).then(sendResponse);
      return true;
    }

    if (name === "discoverAttachments") {
      void Promise.resolve(discoverAttachments())
        .then((result) => {
          console.log("[up2stage:content] discoverAttachments result:", result.length);
          sendResponse(result);
        })
        .catch((e) => {
          console.error("[up2stage:content] discoverAttachments failed:", e);
          sendResponse([]);
        });
      return true;
    }

    return false;
  };

  window.__up2stageMessageListener = listener;
  chrome.runtime.onMessage.addListener(listener);
}

function checkAndRenderOverlay() {
  const url = new URL(window.location.href);
  const matched = findMatchingRule(url);

  if (matched) {
    mountOverlay({
      onOpen: () => {
        unmountOverlay();
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
  matches: ["http://*/*", "https://*/*", "file://*/*"],
  main() {
    console.log("Up to Stage content script loaded");
    setupMessageHandler();
    checkAndRenderOverlay();
  },
});
