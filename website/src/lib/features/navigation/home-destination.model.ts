import type { PageContext } from './page.types.ts';

export function homeDestination(context: PageContext): string {
  for (const page of context.pages) {
    if (page.id === 'home') {
      return page.url;
    }
  }

  throw new Error('Missing localized home page');
}
