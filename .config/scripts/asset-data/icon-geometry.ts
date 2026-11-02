import {
  array,
  record,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { IconGeometry } from './asset-data.types.ts';
import { number } from './number.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function iconGeometry(): Promise<IconGeometry> {
  const file = await readFile('.config/icon-assets.yaml', 'utf8');

  const parsed: unknown = parse(file);

  const source = record(parsed, 'icon geometry');

  const displaySizes = array(source['display_sizes'], 'display sizes');

  const normalizedSizes = displaySizes.map(number);

  return {
    tile_size: number(source['tile_size']),
    compact_tile_size: number(source['compact_tile_size']),
    interface_grid: number(source['interface_grid']),
    display_sizes: normalizedSizes,
    icons: record(source['icons'], 'icon geometry entries'),
  };
}
