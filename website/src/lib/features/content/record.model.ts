import type { UnknownRecord } from './unknown-record.model.ts';

export function record(value: unknown, label: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${label}: expected an object`);
  }

  return value as UnknownRecord;
}
