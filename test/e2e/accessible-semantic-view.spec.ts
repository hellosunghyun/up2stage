import AxeBuilder from "@axe-core/playwright";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium, expect, test, type BrowserContext, type Page } from "@playwright/test";

const extensionPath = path.resolve(".output/chrome-mv3");
const CASE_ID = "case-accessibility-e2e";
const DOCUMENT_ID = "doc-accessibility-e2e";
const SOURCE_ID = `src:${DOCUMENT_ID}:p1:e1`;

async function launchExtension(profile: string): Promise<BrowserContext> {
  const headless = process.env.PLAYWRIGHT_HEADLESS === "true";
  return chromium.launchPersistentContext(profile, {
    headless,
    ...(headless ? { channel: "chromium" } : {}),
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });
}

async function extensionId(context: BrowserContext): Promise<string> {
  let worker = context.serviceWorkers()[0];
  worker ??= await context.waitForEvent("serviceworker");
  return new URL(worker.url()).host;
}

async function seedViewer(page: Page): Promise<void> {
  await page.evaluate(
    ({ caseId, documentId }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("up2stage");
        request.onerror = () =>
          reject(new Error(request.error?.message ?? "IndexedDB를 열지 못했습니다."));
        request.onsuccess = () => {
          const database = request.result;
          const sourceData = [
            {
              elementId: "1",
              category: "heading2",
              text: "지원 자격",
              html: "<h2>지원 자격</h2>",
              type: "heading"
            },
            {
              elementId: "2",
              category: "list",
              text: "① 서울 소재 대학\n② 백분위 90점 이상",
              html: '<p data-category="list">① 서울 소재 대학<br>② 백분위 90점 이상</p>',
              type: "list"
            },
            {
              elementId: "3",
              category: "table",
              text: "구분 조건 성적 90점 이상",
              html: '<table><thead><tr><th scope="col">구분</th><th scope="col">조건</th></tr></thead><tbody><tr><th scope="row">성적</th><td>90점 이상</td></tr></tbody></table>',
              type: "table"
            }
          ].map((item) => {
            const sourceId = `src:${documentId}:p1:e${item.elementId}`;
            return {
              source: {
                sourceId,
                caseId,
                documentId,
                page: 1,
                elementId: item.elementId,
                category: item.category,
                text: item.text,
                html: item.html,
                semanticNodeId: sourceId
              },
              parseElement: {
                id: `pe:${sourceId}`,
                caseId,
                documentId,
                sourceId,
                elementId: item.elementId,
                category: item.category,
                type: item.type,
                page: 1,
                text: item.text,
                html: item.html
              }
            };
          });

          const transaction = database.transaction(
            ["cases", "documents", "parseElements", "sources"],
            "readwrite"
          );
          transaction.objectStore("cases").put({
            id: caseId,
            sourcePage: {
              url: "https://example.com/scholarship",
              title: "장학금 공고",
              normalizedUrl: "https://example.com/scholarship"
            },
            status: "processed",
            selectedDocumentIds: [documentId],
            agentJobId: "job-accessibility-e2e",
            agentStatus: "completed",
            createdAt: 0,
            updatedAt: 1
          });
          transaction.objectStore("documents").put({
            id: documentId,
            caseId,
            fileName: "장학금 공고.pdf",
            extension: "pdf",
            contentHash: "accessibility-e2e-hash",
            renderType: "unsupported",
            processingStatus: "complete",
            createdAt: 0
          });
          for (const item of sourceData) {
            transaction.objectStore("sources").put(item.source);
            transaction.objectStore("parseElements").put(item.parseElement);
          }
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () =>
            reject(new Error(transaction.error?.message ?? "Viewer fixture를 저장하지 못했습니다."));
        };
      }),
    { caseId: CASE_ID, documentId: DOCUMENT_ID }
  );
}

async function storedSourceCount(page: Page): Promise<number> {
  return page.evaluate(
    (caseId) =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open("up2stage");
        request.onerror = () => reject(new Error("IndexedDB source count를 읽지 못했습니다."));
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("sources", "readonly");
          const countRequest = transaction.objectStore("sources").index("caseId").count(caseId);
          countRequest.onsuccess = () => resolve(countRequest.result);
          countRequest.onerror = () => reject(new Error("Source count를 읽지 못했습니다."));
          transaction.oncomplete = () => database.close();
        };
      }),
    CASE_ID
  );
}

async function storedSourceDocumentIds(page: Page): Promise<string[]> {
  return page.evaluate(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const request = indexedDB.open("up2stage");
        request.onerror = () => reject(new Error("IndexedDB source를 읽지 못했습니다."));
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("sources", "readonly");
          const getRequest = transaction.objectStore("sources").getAll();
          getRequest.onsuccess = () => {
            const values = getRequest.result as Array<{ documentId?: unknown }>;
            resolve(
              values.map((value) =>
                typeof value.documentId === "string" ? value.documentId : "missing"
              )
            );
          };
          getRequest.onerror = () => reject(new Error("Source records를 읽지 못했습니다."));
          transaction.oncomplete = () => database.close();
        };
      })
  );
}

test("@a11y source navigation focuses a semantic document without axe violations", async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), "up2stage-a11y-e2e-"));
  const context = await launchExtension(profile);

  try {
    const id = await extensionId(context);
    const viewer = await context.newPage();
    await viewer.goto(`chrome-extension://${id}/viewer.html?case=prepare-accessibility-schema`);
    await expect(viewer.getByText("저장된 문서를 찾지 못했어요.")).toBeVisible();
    await seedViewer(viewer);
    expect(await storedSourceCount(viewer)).toBe(3);
    expect(await storedSourceDocumentIds(viewer)).toEqual([
      DOCUMENT_ID,
      DOCUMENT_ID,
      DOCUMENT_ID
    ]);
    const params = new URLSearchParams({
      case: CASE_ID,
      document: DOCUMENT_ID,
      source: SOURCE_ID
    });
    await viewer.goto(`chrome-extension://${id}/viewer.html?${params.toString()}`);

    await expect(viewer.locator("aside")).toHaveCount(1);
    await expect(viewer.getByLabel(/AI 안내 및 근거/)).toHaveCount(0);
    const shellColumns = await viewer.getByTestId("viewer-shell").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean)
    );
    expect(shellColumns).toHaveLength(2);

    await expect(viewer.getByRole("tab", { name: "접근성 보기" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    const heading = viewer.getByRole("heading", { level: 2, name: "지원 자격" });
    await expect(heading).toBeVisible();
    await expect(heading.locator("..")).toBeFocused();
    await expect(viewer.getByRole("list")).toBeVisible();
    await expect(viewer.getByRole("table")).toBeVisible();
    await expect(viewer.getByRole("columnheader", { name: "구분" })).toHaveAttribute(
      "scope",
      "col"
    );

    await heading.locator("..").press("Enter");
    await expect(viewer.getByText("1쪽 원문 근거를 선택했습니다.")).toBeAttached();
    await heading.locator("..").press("Escape");
    const accessibilityTab = viewer.getByRole("tab", { name: "접근성 보기" });
    await expect(accessibilityTab).toBeFocused();
    await accessibilityTab.press("Shift+Tab");
    await expect(viewer.getByRole("tab", { name: "원문 보기" })).toBeFocused();
    await viewer.getByRole("tab", { name: "원문 보기" }).press("Tab");
    await expect(accessibilityTab).toBeFocused();

    const results = await new AxeBuilder({ page: viewer })
      .include("#viewer-workspace-panel")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);

    if (process.env.PLAYWRIGHT_QA_SCREENSHOT) {
      await viewer.screenshot({ path: process.env.PLAYWRIGHT_QA_SCREENSHOT });
    }
    const holdMs = Math.min(Number(process.env.PLAYWRIGHT_QA_HOLD_MS ?? 0), 60_000);
    if (holdMs > 0) {
      await heading.locator("..").focus();
      await viewer.waitForTimeout(holdMs);
    }
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
