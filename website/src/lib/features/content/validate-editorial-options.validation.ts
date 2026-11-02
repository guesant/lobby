import { validateEditorialFlags } from './validate-editorial-flags.validation.ts';
import type { UnknownRecord } from './validation.model.ts';

export function validateEditorialOptions(
  item: UnknownRecord,
  label: string,
): void {
  validateEditorialFlags(item, label);

  for (const key of [
    'url',
    'group',
    'status',
    'updated',
  ]) {
    if (item[key] !== undefined && typeof item[key] !== 'string') {
      throw new Error(`Invalid ${label}.${key}`);
    }
  }

  if (
    typeof item['url'] === 'string' &&
    /^\s*(javascript|data|vbscript):/i.test(item['url'])
  ) {
    throw new Error(`Invalid ${label}.url`);
  }
}
