import type { SiteData } from '../content/content.types.ts';
import { pagesFor } from './catalog.model.ts';
import type { TerminalEntry } from './entries.types.ts';

export function terminalPaths(
  data: SiteData,
  language: SiteData['links']['language_options'][number],
): TerminalEntry[] {
  const prefix = `${language.path}terminal/`;

  const entries: TerminalEntry[] = [];

  for (const page of pagesFor(data, language.id, 'terminal')) {
    if (!page.fallback) {
      const pagePath = page.url.slice(prefix.length);

      const path = pagePath.replace(/\/$/, '');

      entries.push({
        locale: language.id,
        path,
      });
    }
  }

  return entries;
}
