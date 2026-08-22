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
  const url = tab.url ?? "";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("현재 페이지에서 확장 프로그램을 실행할 수 없어요. http/https 웹페이지에서 다시 시도해 주세요.");
  }
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

  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
