import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { readFile } from 'node:fs/promises';

export async function iconCatalog(): Promise<Record<string, boolean>> {
  const file = await readFile('.config/icon-catalog.json', 'utf8');

  const value: unknown = JSON.parse(file);

  const output: Record<string, boolean> = {};

  const source = record(value, 'icon catalog');

  for (const [
    key,
    colored,
  ] of Object.entries(source)) {
    if (typeof colored !== 'boolean') {
      throw new Error('Invalid icon color flag');
    }

    output[key] = colored;
  }

  return output;
}
