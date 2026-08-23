import { mapExtractToSources } from "./extract";
import type { ExtractLocation, ExtractLocationMapping, SourceRecord } from "./types";

const METADATA_KEYS = new Set([
  "previous_step_name",
  "step_run_id",
  "occurrence_id",
  "job_execution_id",
  "cache_hit",
  "page_ranges",
  "program_name",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPoint(value: unknown): value is { x: number; y: number } {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number"
  );
}

function isPointArray(value: unknown): value is { x: number; y: number }[] {
  return Array.isArray(value) && value.every(isPoint);
}

function isWordCoordinates(value: unknown): value is { x: number; y: number }[][] {
  return Array.isArray(value) && value.every(isPointArray);
}

function isExtractLeaf(value: unknown): value is { _value: string } {
  return isRecord(value) && typeof value._value === "string";
}

function toExtractLocation(value: Record<string, unknown>): ExtractLocation {
  const rawValue = String(value._value);
  const page = typeof value.page === "number" ? value.page : 1;
  const coordinates = isPointArray(value.coordinates) ? value.coordinates : [];
  const wordCoordinates = isWordCoordinates(value.word_coordinates)
    ? value.word_coordinates
    : [];

  const location: ExtractLocation = {
    rawValue,
    page,
    coordinates,
    wordCoordinates,
  };

  if (typeof value.confidence_score === "number") {
    location.confidence = value.confidence_score;
  }

  return location;
}

export function buildExtractLocationMap(
  sources: readonly SourceRecord[],
  root: Record<string, unknown>,
  pathPrefix = ""
): Map<string, ExtractLocationMapping> {
  const map = new Map<string, ExtractLocationMapping>();

  for (const [key, value] of Object.entries(root)) {
    if (METADATA_KEYS.has(key)) continue;

    const path = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (isExtractLeaf(value)) {
      const mapping = mapExtractToSources(sources, toExtractLocation(value));
      map.set(path, mapping);
      continue;
    }

    if (Array.isArray(value)) {
      const items = value as unknown[];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item === undefined) continue;
        const itemPath = `${path}[${i}]`;

        if (isExtractLeaf(item)) {
          const mapping = mapExtractToSources(sources, toExtractLocation(item));
          map.set(itemPath, mapping);
          continue;
        }

        if (isRecord(item)) {
          const nested = buildExtractLocationMap(sources, item, itemPath);
          for (const [k, v] of nested) {
            map.set(k, v);
          }
        }
      }
      continue;
    }

    if (isRecord(value)) {
      const nested = buildExtractLocationMap(sources, value, path);
      for (const [k, v] of nested) {
        map.set(k, v);
      }
    }
  }

  return map;
}
