import { requiredText } from '../content/validation.model.ts';

export function catalogIdentity(value: unknown, ids: Set<string>): string {
  const id = requiredText(value, 'catalog identifier');

  if (!/^[a-z][a-z0-9-]{0,127}$/.test(id) || ids.has(id)) {
    throw new Error(`Invalid or duplicate catalog identifier: ${id}`);
  }

  ids.add(id);

  return id;
}
