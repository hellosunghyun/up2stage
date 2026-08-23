import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
} from "../../../../src/core/storage/apiKey";

describe("apiKey storage", () => {
  const store: Record<string, unknown> = {};

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.stubGlobal("chrome", {
      storage: {
        session: {
          get: vi.fn((key: string) => Promise.resolve({ [key]: store[key] })),
          set: vi.fn((items: Record<string, unknown>) => {
            Object.assign(store, items);
            return Promise.resolve();
          }),
          remove: vi.fn((key: string) => {
            delete store[key];
            return Promise.resolve();
          }),
        },
      },
    });
  });

  it("returns null when no key is stored", async () => {
    const key = await getApiKey();
    expect(key).toBeNull();
  });

  it("stores and retrieves the API key without persistence", async () => {
    const value = "up-test-key-123";
    await setApiKey(value);
    const retrieved = await getApiKey();
    expect(retrieved).toBe(value);
  });

  it("clears the API key", async () => {
    await setApiKey("up-secret");
    await clearApiKey();
    const key = await getApiKey();
    expect(key).toBeNull();
  });
});
