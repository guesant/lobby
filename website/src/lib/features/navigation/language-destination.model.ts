import { textOr } from '../content/text-or.model.ts';
import type { LanguageRoute } from './language.types.ts';

export function languageDestination(
  route: LanguageRoute,
  source: URL,
  manual = false,
): URL | null {
  let fallback = '';

  if (manual) {
    fallback = route.home;
  }

  const path = textOr(route.url, fallback);

  if (!path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  const target = new URL(path, source);

  if (target.origin !== source.origin) {
    return null;
  }

  target.search = source.search;

  if (route.url) {
    target.hash = source.hash;
  }

  return target;
}
