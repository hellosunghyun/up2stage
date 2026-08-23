import { describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { Up2StageDB } from "../../../../src/core/storage/db";

const V1_STORES = {
  cases: "&id, status, agentJobId",
  documents: "&id, caseId, [caseId+contentHash], contentHash, upstageFileId",
  parseElements: "&id, [caseId+documentId], caseId, sourceId",
  extracts: "&id, [caseId+documentId], caseId",
  guidance: "&id, caseId",
  documentCache: "++id, &[contentHash+agentVersion]",
  agentJobs: "&id, caseId",
};

describe("IndexedDB v2 migration", () => {
  it("preserves v1 case data and adds integration tables", async () => {
    const name = `up2stage-migration-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores(V1_STORES);
    await legacy.open();
    await legacy.table("cases").put({
      id: "case-v1",
      sourcePage: { url: "https://x", title: "X", normalizedUrl: "https://x" },
      status: "discovered",
      selectedDocumentIds: [],
      createdAt: 0,
      updatedAt: 0,
    });
    legacy.close();

    const migrated = new Up2StageDB(name);
    await migrated.open();

    expect(migrated.verno).toBe(2);
    expect(await migrated.cases.get("case-v1")).toBeDefined();
    expect(migrated.tables.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        "sources",
        "quickQuestions",
        "documentFiles",
        "userAnswers",
        "decisions",
        "actionItems",
      ])
    );

    await migrated.delete();
  });
});
