import { describe, it, expect, vi, beforeEach } from "vitest";
import { webcrypto } from "node:crypto";
import { sha256 } from "../../../src/utils/hash";

describe("sha256", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", webcrypto);
  });

  it("computes a stable hex hash for the same bytes", async () => {
    const bytes = new TextEncoder().encode("up2stage");
    const a = await sha256(bytes);
    const b = await sha256(bytes);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different bytes", async () => {
    const a = await sha256(new TextEncoder().encode("A"));
    const b = await sha256(new TextEncoder().encode("B"));
    expect(a).not.toBe(b);
  });
});
