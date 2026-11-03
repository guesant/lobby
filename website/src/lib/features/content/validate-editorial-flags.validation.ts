import type { UnknownRecord } from './validation.types.ts';

export function validateEditorialFlags(
  item: UnknownRecord,
  label: string,
): void {
  for (const flag of [
    'enabled',
    'public',
    'private',
    'draft',
  ]) {
    if (item[flag] !== undefined && typeof item[flag] !== 'boolean') {
      throw new Error(`Invalid ${label}.${flag}`);
    }
  }
}
