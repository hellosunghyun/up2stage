import { describe, it, expect } from "vitest";
import {
  createSelection,
  toggleSelection,
  selectAll,
  canStartAnalysis,
  getSelected,
} from "../../../src/features/document-selection/selection";

const ids = ["a", "b", "c"];

const attachments = [
  { id: "a", fileName: "공고문.pdf" },
  { id: "b", fileName: "신청서.hwp" },
  { id: "c", fileName: "목록.xlsx" },
];

describe("document selection", () => {
  it("selects all by default", () => {
    const state = createSelection(ids);
    expect(state.selectedIds).toEqual(new Set(["a", "b", "c"]));
    expect(state.consentChecked).toBe(false);
  });

  it("toggles a single selection off", () => {
    const state = createSelection(ids);
    const next = toggleSelection(state, "b");
    expect(next.selectedIds).toEqual(new Set(["a", "c"]));
  });

  it("toggles a single selection on", () => {
    const state = createSelection(ids);
    const noB = toggleSelection(state, "b");
    const restored = toggleSelection(noB, "b");
    expect(restored.selectedIds).toEqual(new Set(["a", "b", "c"]));
  });

  it("deselects all", () => {
    const state = createSelection(ids);
    const next = selectAll(state, ids, false);
    expect(next.selectedIds.size).toBe(0);
  });

  it("selects all", () => {
    const state = createSelection(ids);
    const noB = toggleSelection(state, "b");
    const all = selectAll(noB, ids, true);
    expect(all.selectedIds).toEqual(new Set(["a", "b", "c"]));
  });

  it("does not allow analysis without consent", () => {
    const state = createSelection(ids);
    expect(canStartAnalysis(state)).toBe(false);
  });

  it("does not allow analysis without selected documents", () => {
    const state = { selectedIds: new Set<string>(), consentChecked: true };
    expect(canStartAnalysis(state)).toBe(false);
  });

  it("allows analysis when documents are selected and consent is given", () => {
    const state = { selectedIds: new Set(["a", "b"]), consentChecked: true };
    expect(canStartAnalysis(state)).toBe(true);
  });

  it("returns only selected documents", () => {
    const state = toggleSelection(createSelection(ids), "b");
    const selected = getSelected(attachments, state.selectedIds);
    expect(selected.map((d) => d.id)).toEqual(["a", "c"]);
  });

  it("returns empty when nothing is selected", () => {
    const state = selectAll(createSelection(ids), ids, false);
    expect(getSelected(attachments, state.selectedIds)).toHaveLength(0);
  });
});
