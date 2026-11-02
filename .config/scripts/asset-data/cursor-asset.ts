import {
  array,
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import type { CursorCatalog } from './asset-data.types.ts';
import { number } from './number.ts';

export function cursorAsset(value: unknown): CursorCatalog['assets'][number] {
  const entry = record(value, 'cursor entry');

  const coordinates = array(entry['hotspot'], 'cursor hotspot');

  if (coordinates.length !== 2) {
    throw new Error('Invalid cursor hotspot');
  }

  return {
    id: requiredText(entry['id'], 'cursor id'),
    source: requiredText(entry['source'], 'cursor source'),
    file: requiredText(entry['file'], 'cursor file'),
    hotspot: [
      number(coordinates[0]),
      number(coordinates[1]),
    ],
  };
}
