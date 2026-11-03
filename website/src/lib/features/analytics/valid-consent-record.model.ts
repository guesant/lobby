import type { ConsentRecord } from './analytics.types.ts';

export function validConsentRecord(value: unknown): ConsentRecord | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (
    record['version'] !== 1 ||
    (record['status'] !== 'granted' && record['status'] !== 'denied') ||
    typeof record['updatedAt'] !== 'number'
  ) {
    return undefined;
  }

  return {
    version: 1,
    status: record['status'],
    updatedAt: record['updatedAt'],
  };
}
