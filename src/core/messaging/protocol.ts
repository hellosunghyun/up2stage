import { defineExtensionMessaging } from "@webext-core/messaging";
import { z } from "zod";

const OpenSidePanelSchema = z.object({ tabId: z.number() });
const OpenViewerSchema = z.object({
  caseId: z.string(),
  documentId: z.string().optional(),
  sourceId: z.string().optional(),
});

export type OpenSidePanelData = z.infer<typeof OpenSidePanelSchema>;
export type OpenViewerData = z.infer<typeof OpenViewerSchema>;

export interface MessagingProtocol {
  openSidePanel(data: OpenSidePanelData): void;
  openViewer(data: OpenViewerData): void;
}

const { sendMessage, onMessage } = defineExtensionMessaging<MessagingProtocol>();

export const messaging = {
  async openSidePanel(data: OpenSidePanelData): Promise<void> {
    await sendMessage("openSidePanel", OpenSidePanelSchema.parse(data));
  },
  onOpenSidePanel(
    handler: (data: OpenSidePanelData) => void | Promise<void>
  ): void {
    onMessage("openSidePanel", async (message) => {
      const parsed = OpenSidePanelSchema.parse(message.data);
      await handler(parsed);
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
};
