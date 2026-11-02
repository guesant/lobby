import { stringList } from './string-list.model.ts';

export function metadataValueValid(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return (
    typeof value === 'string' || typeof value === 'boolean' || stringList(value)
  );
}
