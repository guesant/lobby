import type { PageRecord } from '../content/content.types.ts';
import { navigationDirectory } from './navigation-directory.model.ts';
import type { NavigationPage } from './navigation-pages.types.ts';

export function navigationPages(pages: PageRecord[]): NavigationPage[] {
  const output: NavigationPage[] = [];

  for (const page of pages) {
    if (
      ![
        'home',
        'links-page',
      ].includes(page.type) &&
      page.id !== 'now'
    ) {
      continue;
    }

    const directory = navigationDirectory(page.id);

    const navigationPage = {
      ...page,
      directory,
    };

    output.push(navigationPage);
  }

  return output;
}
