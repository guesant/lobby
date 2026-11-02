import type { CollectionResult } from '../statistics.types.ts';

export function hasUpdatedStatistics(results: CollectionResult[]): boolean {
  for (const result of results) {
    if (result.status === 'updated') {
      return true;
    }
  }

  return false;
}
