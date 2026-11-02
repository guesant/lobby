import { metadataValueValid } from './metadata-value-valid.model.ts';

export function validMetadata(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  for (const entry of Object.values(value)) {
    if (!metadataValueValid(entry)) {
      return false;
    }
  }

  return true;
}
