import { describe, it, expect } from "vitest";
import {
  findMatchingRule,
  defaultContextRules,
} from "../../../src/features/contextual-overlay/rules";

describe("contextual-overlay rules", () => {
  it("matches the demo scholarship URL", () => {
    const url = new URL("https://example.org/scholarship/2026");
    const matched = findMatchingRule(url);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe("demo-scholarship");
  });

  it("does not match a non-scholarship path on example.org", () => {
    const url = new URL("https://example.org/about");
    const matched = findMatchingRule(url);
    expect(matched).toBeUndefined();
  });

  it("does not match the demo rule on another host", () => {
    const url = new URL("https://other.org/scholarship/2026");
    const matched = findMatchingRule(url);
    expect(matched).toBeUndefined();
  });

  it("uses the provided rule list", () => {
    const url = new URL("https://example.org/scholarship/2026");
    const matched = findMatchingRule(url, defaultContextRules);
    expect(matched).toBeDefined();
  });

  it("matches the hiss.or.kr host", () => {
    const url = new URL("http://hissf.or.kr/");
    const matched = findMatchingRule(url);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe("hissf-or.kr");
  });

  it("does not match a non-hissf host", () => {
    const url = new URL("http://other.or.kr/");
    const matched = findMatchingRule(url);
    expect(matched).toBeUndefined();
  });
});
