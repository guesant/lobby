import { getSiteData } from '../content/content.server.ts';
import type { SiteData } from '../content/content.types.ts';
import { pagesFor, routeEntries } from './catalog.model.ts';

type MinecraftEntry = {
  path: string;
};

type TerminalEntry = {
  locale: string;
  path: string;
};

export async function minecraftEntries(): Promise<MinecraftEntry[]> {
  const data = await getSiteData();

  return [
    '',
    ...routeEntries(data),
  ]
    .filter((path): boolean => {
      return path.split('/')[1] !== 'terminal';
    })
    .map((path): MinecraftEntry => {
      return {
        path,
      };
    });
}

function terminalPaths(
  data: SiteData,
  language: SiteData['links']['language_options'][number],
): TerminalEntry[] {
  const prefix = `${language.path}terminal/`;

  return pagesFor(data, language.id, 'terminal')
    .filter((page): boolean => {
      return !page.fallback;
    })
    .map((page): TerminalEntry => {
      return {
        locale: language.id,
        path: page.url.slice(prefix.length)
          .replace(/\/$/, ''),
      };
    });
}

export async function terminalEntries(): Promise<TerminalEntry[]> {
  const data = await getSiteData();

  return data.links.language_options.flatMap((language): TerminalEntry[] => {
    return terminalPaths(data, language);
  });
}
