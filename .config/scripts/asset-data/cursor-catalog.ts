import {
  array,
  record,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { CursorCatalog } from './asset-data.types.ts';
import { cursorAsset } from './cursor-asset.ts';
import { number } from './number.ts';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export async function cursorCatalog(): Promise<CursorCatalog> {
  const file = await readFile('.config/cursor-assets.yaml', 'utf8');

  const parsed: unknown = parse(file);

  const source = record(parsed, 'cursor catalog');

  const cursorAssets = array(source['assets'], 'cursor assets');

  const assets = cursorAssets.map(cursorAsset);

  return {
    browser_size: number(source['browser_size']),
    padding: number(source['padding']),
    assets,
  };
}
