export interface SelectionState {
  selectedIds: Set<string>;
  consentChecked: boolean;
}

export function createSelection(allIds: string[]): SelectionState {
  return { selectedIds: new Set(allIds), consentChecked: false };
}

export function toggleSelection(
  state: SelectionState,
  id: string
): SelectionState {
  const next = new Set(state.selectedIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return { ...state, selectedIds: next };
}

export function selectAll(
  state: SelectionState,
  allIds: string[],
  selected: boolean
): SelectionState {
  return { ...state, selectedIds: selected ? new Set(allIds) : new Set() };
}

export function canStartAnalysis(state: SelectionState): boolean {
  return state.selectedIds.size > 0 && state.consentChecked;
}

export function getSelected<T extends { id: string }>(
  items: T[],
  selectedIds: Set<string>
): T[] {
  return items.filter((i) => selectedIds.has(i.id));
}
