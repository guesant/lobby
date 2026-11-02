import type { PageRecord } from '../content/content.types.ts';
import { navigationDirectory } from './navigation-directory.model.ts';

export type NavigationPage = PageRecord & {
  directory: string;
};

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
