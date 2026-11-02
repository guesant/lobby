import type { PageLoadData } from '../content/content.types.ts';

export function personSameAs(page: PageLoadData): string[] {
  const output: string[] = [];

  for (const link of page.quickLinks) {
    if (page.config.profile.same_as_links.includes(link.id)) {
      output.push(link.url);
    }
  }

  return output;
}
