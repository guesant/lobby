import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from './catalog.model.ts';
import type { TerminalEntry } from './entries.types.ts';

export function terminalPaths(
  data: SiteData,
  language: SiteData['links']['language_options'][number],
): TerminalEntry[] {
  const entries: TerminalEntry[] = [];

  for (const page of pagesFor(data, language.id)) {
    if (!page.fallback) {
      let path = page.id;

      if (path === 'home') {
        path = '';
      }

      entries.push({
        locale: language.id,
        path,
      });
    }
  }

  entries.push({
    locale: language.id,
    path: 'privacy',
  });

  return entries;
}
