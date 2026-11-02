import type { PageRecord } from '../features/content/content.types.ts';

export function isNowPage(entry: PageRecord): boolean {
  return entry.id === 'now';
}
