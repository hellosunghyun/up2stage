import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { chromium, expect, test } from "@playwright/test";

const extensionPath = path.resolve(".output/chrome-mv3");

test("built extension exposes the Up to Stage Side Panel and Viewer", async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), "up2stage-e2e-"));
  const webServer = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end('<!doctype html><title>검증 페이지</title><a href="/notice.pdf">공고문.pdf</a>');
  });
  await new Promise<void>((resolve, reject) => {
    webServer.once("error", reject);
    webServer.listen(0, "127.0.0.1", resolve);
  });
  const address = webServer.address();
  if (!address || typeof address === "string") throw new Error("검증용 서버를 시작하지 못했습니다");
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
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
    const runtimeErrors: string[] = [];

    const panel = await context.newPage();
    panel.on("pageerror", (error) => runtimeErrors.push(`panel: ${error.message}`));
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await expect(panel).toHaveTitle("Up to Stage");
    await expect(panel.locator('img[alt="Up to Stage"]')).toBeVisible();
    const manifestName = await panel.evaluate(() => chrome.runtime.getManifest().name);
    expect(manifestName).toBe("Up to Stage");

    const viewer = await context.newPage();
    viewer.on("pageerror", (error) => runtimeErrors.push(`viewer: ${error.message}`));
    await viewer.goto(`chrome-extension://${extensionId}/viewer.html`);
    await expect(viewer.getByText("Case ID가 없어 문서를 열 수 없어요.")).toBeVisible();

    const caseId = "case-viewer-e2e";
    const documentId = "doc-viewer-e2e";
    const sourceId = "src:doc-viewer-e2e:p1:e1";
    const viewerUrl = `chrome-extension://${extensionId}/viewer.html?case=${caseId}&document=${documentId}&source=${encodeURIComponent(sourceId)}`;

    await viewer.goto(`chrome-extension://${extensionId}/viewer.html?case=${caseId}`);
    await expect(viewer.getByText("저장된 문서를 찾지 못했어요.")).toBeVisible();
    await viewer.evaluate(
      async ({ caseId, documentId, sourceId }) => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("up2stage");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(new Error(request.error?.message ?? "IndexedDB open failed"));
        });
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(
            ["cases", "documents", "sources", "documentFiles", "guidance"],
            "readwrite"
          );
          transaction.objectStore("cases").put({
            id: caseId,
            sourcePage: {
              url: "http://127.0.0.1/notice",
              title: "검증 페이지",
              normalizedUrl: "http://127.0.0.1/notice"
            },
            status: "processed",
            selectedDocumentIds: [documentId],
            agentJobId: "job-viewer-e2e",
            agentStatus: "completed",
            createdAt: 0,
            updatedAt: 0
          });
          transaction.objectStore("documents").put({
            id: documentId,
            caseId,
            fileName: "검증용 원문.unsupported",
            extension: "unsupported",
            contentHash: "viewer-e2e-hash",
            renderType: "unsupported",
            processingStatus: "complete",
            createdAt: 0
          });
          transaction.objectStore("sources").put({
            sourceId,
            caseId,
            documentId,
            page: 1,
            elementId: 1,
            category: "paragraph",
            text: "검증용 원문 근거"
          });
          transaction.objectStore("documentFiles").put({
            documentId,
            caseId,
            bytes: new ArrayBuffer(0),
            createdAt: 0
          });
          transaction.objectStore("guidance").put({
            id: "guidance-viewer-e2e",
            caseId,
            overview: "검증용 안내",
            topRequirements: ["검증용 지원 조건【†1】"],
            nearestDeadline: "",
            requiredSubmissions: [],
            topCautions: [],
            nextActions: [],
            missingInformation: [],
            personalizationStatus: "not_evaluated",
            citations: [
              {
                index: 1,
                sourceType: "extract",
                sourceRef: "key_requirements[0]",
                nodeIndex: 0,
                sourceIds: [sourceId]
              }
            ]
          });
          transaction.oncomplete = () => resolve();
          transaction.onerror = () =>
            reject(new Error(transaction.error?.message ?? "IndexedDB seed failed"));
        });
        database.close();
        await chrome.storage.session.set({ up2stage_currentCaseId: caseId });
      },
      { caseId, documentId, sourceId }
    );

    await viewer.goto(viewerUrl);
    await expect(viewer).toHaveTitle("Up to Stage 문서 보기");
    await expect(viewer.getByText("문서 목차", { exact: true })).toBeVisible();
    await expect(viewer.getByText("지원하지 않는 형식")).toBeVisible();
    await expect(viewer.locator("aside")).toHaveCount(1);
    await expect(viewer.getByText("주요 요약")).toHaveCount(0);
    const viewerGrid = await viewer.locator("#root > div").evaluate((element) => ({
      columns: (element as HTMLElement).style.gridTemplateColumns,
      width: (element as HTMLElement).getBoundingClientRect().width
    }));
    expect(viewerGrid.columns).toContain("224px");
    expect(viewerGrid.columns).not.toContain("443px");
    expect(viewerGrid.width).toBeGreaterThan(800);

    const outlineSource = viewer.getByRole("button", { name: /검증용 원문 근거/ });
    await expect(outlineSource).toHaveCSS("color", "rgb(210, 255, 149)");
    await viewer.getByRole("tab", { name: "구조 보기" }).click();
    await expect(viewer.getByRole("heading", { name: "문서 구조" })).toBeVisible();
    await expect(
      viewer.getByRole("button", { name: "검증용 원문 근거", exact: true })
    ).toBeVisible();

    const sourcePage = await context.newPage();
    await sourcePage.goto(`http://127.0.0.1:${address.port}/`);
    await expect(sourcePage).toHaveTitle("검증 페이지");
    await sourcePage.bringToFront();
    await panel.reload();
    await expect(panel.getByText("문서를 모두 확인했어요")).toBeVisible();
    const sourceButton = panel.getByRole("button", { name: "검증용 원문.unsupported · p.1" });
    await expect(sourceButton).toBeVisible();
    const [sourceViewer] = await Promise.all([
      context.waitForEvent("page"),
      sourceButton.click()
    ]);
    sourceViewer.on("pageerror", (error) => runtimeErrors.push(`source-viewer: ${error.message}`));
    await sourceViewer.waitForLoadState("domcontentloaded");
    await expect(sourceViewer).toHaveURL(new RegExp(`viewer\\.html\\?case=${caseId}.*source=`));
    await expect(sourceViewer.locator("aside")).toHaveCount(1);
    await expect(sourceViewer.getByText("주요 요약")).toHaveCount(0);

    expect(runtimeErrors).toEqual([]);

    if (process.env.QA_SCREENSHOT_PATH) {
      await viewer.screenshot({ path: process.env.QA_SCREENSHOT_PATH, fullPage: true });
    }
  } finally {
    await context.close();
    await new Promise<void>((resolve, reject) =>
      webServer.close((error) => (error ? reject(error) : resolve()))
    );
    await rm(profile, { recursive: true, force: true });
  }
});
