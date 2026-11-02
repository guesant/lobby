import type { PageRecord } from '../features/content/content.types.ts';

export function isNavigationPage(entry: PageRecord): boolean {
  return entry.type === 'home' || entry.type === 'links-page';
}
