import type { PageLoadData } from '../content/content.types.ts';
import { nowLinks } from './now-links.viewmodel.ts';
import type { UpdatePage } from './pages-for-navigation.types.ts';

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
