import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium, expect, test } from "@playwright/test";

const extensionPath = path.resolve(".output/chrome-mv3");

test("built extension exposes the Up to Stage Side Panel and Viewer", async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), "up2stage-e2e-"));
  const headless = process.env.PLAYWRIGHT_HEADLESS === "true";
  const context = await chromium.launchPersistentContext(profile, {
    headless,
    ...(headless ? { channel: "chromium" } : {}),
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    let worker = context.serviceWorkers()[0];
    worker ??= await context.waitForEvent("serviceworker");
    const extensionId = new URL(worker.url()).host;

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await expect(panel).toHaveTitle("Up to Stage");
    await expect(panel.locator('img[alt="Up to Stage"]')).toBeVisible();
    const manifestName = await panel.evaluate(() => chrome.runtime.getManifest().name);
    expect(manifestName).toBe("Up to Stage");

    const viewer = await context.newPage();
    await viewer.goto(`chrome-extension://${extensionId}/viewer.html`);
    await expect(viewer.getByText("Case ID가 없어 문서를 열 수 없어요.")).toBeVisible();
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
