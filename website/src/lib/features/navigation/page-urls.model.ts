import type { RouteContext } from './catalog.types.ts';
import type { ConfiguredPage } from './routes.model.ts';

export function pageURLs(
  page: ConfiguredPage,
  context: RouteContext,
): {
  standard: string;
  terminal: string;
} {
  if (page.id === 'now' && page.fallback) {
    return {
      standard: `${context.englishPath}now/`,
      terminal: `${context.englishPath}terminal/now/`,
    };
  }

  let terminal = `${context.localePath}terminal/`;

  if (page.id !== 'home' && !page.fallback) {
    terminal = `${context.localePath}terminal/${page.id}/`;
  }

  return {
    standard: page.url,
    terminal,
  };
}
