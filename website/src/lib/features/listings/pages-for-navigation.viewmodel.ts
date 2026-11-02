import type { PageLoadData, PageRecord } from '../content/content.types.ts';
import { nowLinks } from './now-links.viewmodel.ts';

export type UpdatePage = PageRecord & {
  nowLinks: ReturnType<typeof nowLinks>;
};

export function pagesForNavigation(data: PageLoadData): UpdatePage[] {
  const output: UpdatePage[] = [];

  for (const page of data.pages) {
    if (page.id === 'now') {
      const links = nowLinks(page, data);

      const updatePage = {
        ...page,
        nowLinks: links,
      };

      output.push(updatePage);
    }
  }

  return output;
}
