import type { PageLoadData } from '../content/content.types.ts';

export function pageTitle(page: PageLoadData): string {
  if (page.page.id === 'home') {
    return page.localized.seo.title;
  }

  if (page.page.id === 'now') {
    return page.now.seo.title;
  }

  return `${page.page.title} | ${page.config.profile.name}`;
}
