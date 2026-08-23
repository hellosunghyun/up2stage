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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
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

    if (name === "downloadAttachment") {
      const { url } = (message as { data: { url: string } }).data;
      void Promise.resolve(
        fetch(url, { method: "GET", credentials: "include" })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(`다운로드 실패: ${res.status}`);
            }
            const mimeType =
              res.headers.get("content-type")?.split(";")[0]?.trim() ??
              "application/octet-stream";
            if (mimeType.startsWith("text/html")) {
              throw new Error("파일 링크가 실제 파일이 아니에요.");
            }
            const bytes = await res.arrayBuffer();
            const base64 = arrayBufferToBase64(bytes);
            return { base64, mimeType };
          })
      )
        .then(sendResponse)
        .catch((e) => {
          console.error("[up2stage:content] downloadAttachment failed:", e);
          sendResponse({
            error: e instanceof Error ? e.message : "파일을 다운로드할 수 없어요.",
          });
        });
      return true;
    }

    if (name === "sidePanelClosed") {
      checkAndRenderOverlay();
      return false;
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
