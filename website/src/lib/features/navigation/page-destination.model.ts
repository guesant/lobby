import type { PageRecord } from '../content/content.types.ts';

export function pageDestination(pages: PageRecord[], pageID: string): string {
  for (const page of pages) {
    if (page.id === pageID && !page.fallback) {
      return page.url;
    }
  }

  return pages[0]?.url ?? '/';
}
