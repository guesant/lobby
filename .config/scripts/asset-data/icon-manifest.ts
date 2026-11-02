import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import type { IconManifest } from './asset-data.types.ts';
import { number } from './number.ts';
import { readFile } from 'node:fs/promises';

export async function iconManifest(): Promise<IconManifest> {
  const file = await readFile('website/src/assets/icons/manifest.json', 'utf8');

  const value: unknown = JSON.parse(file);

  const source = record(value, 'icon manifest');

  const icons: IconManifest['icons'] = {};

  const manifestEntries = record(source['icons'], 'icon manifest entries');

  for (const [
    key,
    value,
  ] of Object.entries(manifestEntries)) {
    const entry = record(value, `icon ${key}`);

    if (typeof entry['colored'] !== 'boolean') {
      throw new Error('Invalid icon color flag');
    }

    icons[key] = {
      colored: entry['colored'],
      position: number(entry['position']),
      opticalScale: number(entry['opticalScale']),
    };
  }

  return {
    count: number(source['count']),
    tileSize: number(source['tileSize']),
    compactTileSize: number(source['compactTileSize']),
    icons,
  };
}
