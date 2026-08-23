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

function friendlyMessagingError(message: string): string {
  if (message.includes("Receiving end does not exist")) {
    return "현재 탭에서 확장 프로그램을 실행할 수 없어요. http/https 웹페이지에서 다시 시도해 주세요.";
  }
  return `메시지 전달 실패: ${message}`;
}

async function sendToContent<T>(name: string): Promise<T> {
  const tabId = await getActiveTabId();
  console.log(`[up2stage:background] sendToContent tabId=${tabId}, name=${name}`);

  try {
    const result = (await chrome.tabs.sendMessage(tabId, { name, data: undefined })) as T;
    console.log(`[up2stage:background] sendToContent response:`, result);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.log("[up2stage:background] sendToContent first try failed:", message);

    if (message.includes("Receiving end does not exist")) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ["content-scripts/content.js"],
          world: "ISOLATED",
        });
        console.log("[up2stage:background] content script re-injected");
      } catch (injectError) {
        const injectMessage = injectError instanceof Error ? injectError.message : String(injectError);
        console.log("[up2stage:background] content script re-injection skipped:", injectMessage);
      }

      try {
        const result = (await chrome.tabs.sendMessage(tabId, { name, data: undefined })) as T;
        console.log(`[up2stage:background] sendToContent retry response:`, result);
        return result;
      } catch (retryError) {
        const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
        console.error("[up2stage:background] sendToContent retry failed:", retryMessage);
        throw new Error(friendlyMessagingError(retryMessage), { cause: retryError });
      }
    }

    console.error("[up2stage:background] sendToContent failed:", message);
    throw new Error(friendlyMessagingError(message), { cause: e });
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
