import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { RailGeometry } from './asset-data.types.ts';
import { number } from './number.ts';
import { readFile } from 'node:fs/promises';

export async function railGeometry(): Promise<RailGeometry> {
  const file = await readFile(
    'website/src/assets/images/ui/suspension-rail.json',
    'utf8',
  );

  const value: unknown = JSON.parse(file);

  const source = record(value, 'rail geometry');

  const slices: RailGeometry['slices'] = {};

  const rawSlices = record(source['slices'], 'rail slices');

  for (const [
    key,
    value,
  ] of Object.entries(rawSlices)) {
    const slice = record(value, `rail ${key}`);

    slices[key] = {
      top: number(slice['top']),
      height: number(slice['height']),
    };
  }

  return {
    width: number(source['width']),
    slices,
  };
}
