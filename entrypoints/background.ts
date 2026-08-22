import { defineBackground } from "wxt/utils/define-background";
import { messaging } from "../src/core/messaging/protocol";
import { defaultContextRules } from "../src/features/contextual-overlay/rules";

function isMatch(url: string): boolean {
  try {
    return defaultContextRules.some((rule) => rule.match(new URL(url)));
  } catch {
    return false;
  }
}

async function injectIfMatch(tabId: number, url: string | undefined) {
  if (!url || !isMatch(url)) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-scripts/content.js"],
    });
  } catch (err) {
    console.error("up to stage content injection failed", err);
  }
}

export default defineBackground(() => {
  console.log("up to stage background started");

  messaging.onOpenSidePanel(async (data, sender) => {
    const tabId = data.tabId ?? sender.tab?.id;
    if (tabId) {
      await chrome.sidePanel.open({ tabId });
    }
  });

  messaging.onOpenViewer(async ({ caseId, documentId, sourceId }) => {
    const params = new URLSearchParams();
    params.set("case", caseId);
    if (documentId) params.set("document", documentId);
    if (sourceId) params.set("source", sourceId);
    const url = chrome.runtime.getURL(`viewer.html?${params.toString()}`);
    await chrome.tabs.create({ url });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if ((changeInfo.status === "complete" || changeInfo.url) && tab.url) {
      void injectIfMatch(tabId, tab.url);
    }
  });

  chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
      void chrome.sidePanel.open({ tabId: tab.id });
    }
  });
});
