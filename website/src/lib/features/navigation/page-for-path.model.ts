import type { PageRecord } from '../content/content.types.ts';

export function pageForPath(
  pages: PageRecord[],
  pathname: string,
): PageRecord | undefined {
  for (const page of pages) {
    if (page.url.replace(/\/+$/, '') === pathname) {
      return page;
    }
  }

  return undefined;
}
