import { defineBackground } from "wxt/utils/define-background";
import {
  messaging,
  type AttachmentPayload,
  type PageContext,
} from "../src/core/messaging/protocol";

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const id = tab?.id;
  if (!id) throw new Error("활성 탭을 찾을 수 없어요.");
  return id;
}

async function sendToContent<T>(name: string): Promise<T> {
  const tabId = await getActiveTabId();
  console.log(`[up2stage:background] sendToContent tabId=${tabId}, name=${name}`);
  const result = (await chrome.tabs.sendMessage(tabId, { name, data: undefined })) as T;
  console.log(`[up2stage:background] sendToContent response:`, result);
  return result;
}

export default defineBackground(() => {
  console.log("up to stage background started");

  messaging.onOpenSidePanel(async (data, sender) => {
    const tabId = data.tabId ?? sender.tab?.id;
    if (tabId) {
      await chrome.sidePanel.open({ tabId });
    }
  });

  messaging.onCurrentPageContext(async () => {
    return sendToContent<PageContext>("currentPageContext");
  });

  messaging.onDiscoverAttachments(async () => {
    return sendToContent<AttachmentPayload[]>("discoverAttachments");
  });

  messaging.onOpenViewer(async ({ caseId, documentId, sourceId }) => {
    const params = new URLSearchParams();
    params.set("case", caseId);
    if (documentId) params.set("document", documentId);
    if (sourceId) params.set("source", sourceId);
    const url = chrome.runtime.getURL(`viewer.html?${params.toString()}`);
    await chrome.tabs.create({ url });
  });

  chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
      void chrome.sidePanel.open({ tabId: tab.id });
    }
  });
});
