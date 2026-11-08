import type { RouteContext } from './catalog.types.ts';
import type { ConfiguredPage } from './routes.types.ts';

export function pageURL(page: ConfiguredPage, context: RouteContext): string {
  if (page.id === 'now' && page.fallback) {
    return `${context.englishPath}now/`;
  }

  return page.url;
}
