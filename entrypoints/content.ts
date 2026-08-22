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

function getMessageName(message: unknown): string | undefined {
  if (message && typeof message === "object" && "name" in message) {
    const value = message.name;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

chrome.runtime.onMessage.addListener((
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  const name = getMessageName(message);

  if (name === "currentPageContext") {
    void Promise.resolve({
      url: window.location.href,
      title: document.title,
    }).then(sendResponse);
    return true;
  }

  if (name === "discoverAttachments") {
    void Promise.resolve(discoverAttachments()).then(sendResponse);
    return true;
  }

  return false;
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
