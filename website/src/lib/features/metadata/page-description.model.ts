import type { PageLoadData } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';

export function pageDescription(page: PageLoadData): string {
  if (page.page.id === 'home') {
    return page.localized.seo.description;
  }

  if (page.page.id === 'now') {
    return page.now.seo.description;
  }

  return textOr(page.page.description, page.localized.seo.description);
}
