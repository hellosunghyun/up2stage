import { defineExtensionMessaging } from "@webext-core/messaging";
import { z } from "zod";

z.config({ jitless: true });

const OpenSidePanelSchema = z.object({ tabId: z.number().optional() });
const OpenViewerSchema = z.object({
  caseId: z.string(),
  documentId: z.string().optional(),
  sourceId: z.string().optional(),
});

const PageContextSchema = z.object({
  url: z.string(),
  title: z.string(),
});

const AttachmentPayloadSchema = z.object({
  id: z.string(),
  url: z.string(),
  fileName: z.string(),
  extension: z.string().optional(),
  label: z.string().optional(),
  sourceElementText: z.string().optional(),
  selected: z.boolean(),
  accessible: z.boolean(),
});

const DiscoverAttachmentsResponseSchema = z.array(AttachmentPayloadSchema);

export type OpenSidePanelData = z.infer<typeof OpenSidePanelSchema>;
export type OpenViewerData = z.infer<typeof OpenViewerSchema>;
export type PageContext = z.infer<typeof PageContextSchema>;
export type AttachmentPayload = z.infer<typeof AttachmentPayloadSchema>;

export interface MessagingProtocol {
  openSidePanel(data: OpenSidePanelData): void;
  openViewer(data: OpenViewerData): void;
  currentPageContext(): Promise<PageContext>;
  discoverAttachments(): Promise<AttachmentPayload[]>;
}

const { sendMessage, onMessage } = defineExtensionMessaging<MessagingProtocol>();

export const messaging = {
  async openSidePanel(data: OpenSidePanelData = {}): Promise<void> {
    await sendMessage("openSidePanel", OpenSidePanelSchema.parse(data));
  },
  onOpenSidePanel(
    handler: (
      data: OpenSidePanelData,
      sender: chrome.runtime.MessageSender
    ) => void | Promise<void>
  ): void {
    onMessage("openSidePanel", async (message) => {
      const parsed = OpenSidePanelSchema.parse(message.data);
      await handler(parsed, message.sender);
    });
  },
  async openViewer(data: OpenViewerData): Promise<void> {
    await sendMessage("openViewer", OpenViewerSchema.parse(data));
  },
  onOpenViewer(
    handler: (data: OpenViewerData) => void | Promise<void>
  ): void {
    onMessage("openViewer", async (message) => {
      const parsed = OpenViewerSchema.parse(message.data);
      await handler(parsed);
    });
  },
  async currentPageContext(): Promise<PageContext> {
    return PageContextSchema.parse(await sendMessage("currentPageContext", undefined));
  },
  onCurrentPageContext(
    handler: () => PageContext | Promise<PageContext>
  ): void {
    onMessage("currentPageContext", async () => {
      return PageContextSchema.parse(await handler());
    });
  },
  async discoverAttachments(): Promise<AttachmentPayload[]> {
    return DiscoverAttachmentsResponseSchema.parse(
      await sendMessage("discoverAttachments", undefined)
    );
  },
  onDiscoverAttachments(
    handler: () => AttachmentPayload[] | Promise<AttachmentPayload[]>
  ): void {
    onMessage("discoverAttachments", async () => {
      return DiscoverAttachmentsResponseSchema.parse(await handler());
    });
  },
};
