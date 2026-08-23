import type { ExtractLocation, SourceRecord } from "./types";

export class SourceRegistry {
  private byId = new Map<string, SourceRecord>();

  register(records: readonly SourceRecord[]): this {
    for (const record of records) {
      this.byId.set(record.sourceId, record);
    }
    return this;
  }

  get(sourceId: string): SourceRecord | undefined {
    return this.byId.get(sourceId);
  }

  has(sourceId: string): boolean {
    return this.byId.has(sourceId);
  }

  all(): SourceRecord[] {
    return [...this.byId.values()];
  }

  byDocument(documentId: string): SourceRecord[] {
    return this.all().filter((s) => s.documentId === documentId);
  }

  mergeLocation(sourceId: string, location: ExtractLocation): boolean {
    const source = this.byId.get(sourceId);
    if (!source) return false;

    const updates: Partial<Pick<SourceRecord, "polygon" | "wordCoordinates" | "confidence" >> = {
      polygon: location.coordinates,
      wordCoordinates: location.wordCoordinates,
    };

    if (location.confidence !== undefined) {
      updates.confidence = location.confidence;
    }

    this.byId.set(sourceId, { ...source, ...updates });
    return true;
  }
}
