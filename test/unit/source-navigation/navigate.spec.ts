import { describe, expect, it, vi } from "vitest";
import type { SourceRecord } from "../../../src/models/canonical";
import {
  fixtureSourceRegistry,
  fixtureSources,
} from "../../fixtures/source-navigation/viewer";
import { navigateToSource } from "../../../src/features/source-navigation/navigate";

function mockViewer() {
  return {
    selectDocument: vi.fn().mockResolvedValue(undefined),
    goToPage: vi.fn().mockResolvedValue(undefined),
    focusSource: vi.fn().mockResolvedValue(undefined),
    outlineSelect: vi.fn(),
    accessibilityFocus: vi.fn(),
  };
}

describe("navigateToSource", () => {
  it("resolves source and drives the viewer through the full flow", async () => {
    const viewer = mockViewer();
    const source = fixtureSources[0];
    if (!source) {
      throw new Error("fixture missing");
    }

    await navigateToSource(source.sourceId, fixtureSourceRegistry, viewer);

    expect(viewer.selectDocument).toHaveBeenCalledWith(source.documentId);
    expect(viewer.goToPage).toHaveBeenCalledWith(source.page);
    expect(viewer.focusSource).toHaveBeenCalledWith(
      expect.objectContaining({ sourceId: source.sourceId })
    );
    expect(viewer.outlineSelect).toHaveBeenCalledWith(
      source.semanticNodeId ?? source.sourceId
    );
    expect(viewer.accessibilityFocus).toHaveBeenCalledWith(
      source.semanticNodeId
    );
  });

  it("does nothing for an unknown source id", async () => {
    const viewer = mockViewer();
    await navigateToSource("src:missing", fixtureSourceRegistry, viewer);
    expect(viewer.selectDocument).not.toHaveBeenCalled();
  });

  it("returns the correct source record from the fixture registry", async () => {
    const source: SourceRecord | undefined =
      await fixtureSourceRegistry.get("src:doc_sample_pdf:p1:e1");
    expect(source?.text).toBe(
      "2026년 하반기 서울인재대학장학금 장학생 선발 공고"
    );
  });
});
