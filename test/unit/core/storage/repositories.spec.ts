import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db } from "../../../../src/core/storage/db";
import {
  saveCase,
  getCase,
  updateCase,
  getCaseWithDocuments,
  saveDocuments,
  getCachedFileId,
  getOrCreateCachedFileId,
} from "../../../../src/core/storage/repositories";
import type { CaseRecord, DocumentRecord } from "../../../../src/models/canonical";

describe("storage repositories", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("saves and loads a case", async () => {
    const caseRecord: CaseRecord = {
      id: "c1",
      sourcePage: { url: "https://x", title: "X", normalizedUrl: "https://x" },
      status: "discovered",
      selectedDocumentIds: ["d1"],
      createdAt: 0,
      updatedAt: 0,
    };
    await saveCase(caseRecord);
    const loaded = await getCase("c1");
    expect(loaded?.sourcePage.title).toBe("X");
    expect(loaded?.status).toBe("discovered");
  });

  it("updates case status and agentJobId", async () => {
    const caseRecord: CaseRecord = {
      id: "c2",
      sourcePage: { url: "https://x", title: "X", normalizedUrl: "https://x" },
      status: "discovered",
      selectedDocumentIds: [],
      createdAt: 0,
      updatedAt: 0,
    };
    await saveCase(caseRecord);
    await updateCase("c2", { status: "processing", agentJobId: "job-1" });
    const loaded = await getCase("c2");
    expect(loaded?.status).toBe("processing");
    expect(loaded?.agentJobId).toBe("job-1");
  });

  it("loads a case with its documents", async () => {
    const caseRecord: CaseRecord = {
      id: "c3",
      sourcePage: { url: "https://x", title: "X", normalizedUrl: "https://x" },
      status: "discovered",
      selectedDocumentIds: ["d1"],
      createdAt: 0,
      updatedAt: 0,
    };
    const doc: DocumentRecord = {
      id: "d1",
      caseId: "c3",
      fileName: "a.pdf",
      extension: "pdf",
      contentHash: "h1",
      renderType: "pdf",
      processingStatus: "pending",
      createdAt: 0,
    };
    await saveCase(caseRecord);
    await saveDocuments([doc]);
    const loaded = await getCaseWithDocuments("c3");
    expect(loaded?.documents).toHaveLength(1);
    expect(loaded?.documents[0]?.fileName).toBe("a.pdf");
  });

  it("reuses cached upstage file id for the same content hash and agent version", async () => {
    const first = await getOrCreateCachedFileId("h1", "v0.22", () =>
      Promise.resolve("file-cached")
    );
    expect(first).toBe("file-cached");

    let called = false;
    const second = await getOrCreateCachedFileId(
      "h1",
      "v0.22",
      () => {
        called = true;
        return Promise.resolve("new-file");
      }
    );
    expect(second).toBe("file-cached");
    expect(called).toBe(false);
    expect(await getCachedFileId("h1", "v0.22")).toBe("file-cached");
  });
});
