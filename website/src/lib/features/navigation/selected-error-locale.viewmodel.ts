import type { ErrorLocale } from './not-found.types.ts';

export function selectedErrorLocale(
  locales: ErrorLocale[],
  selected: string,
): ErrorLocale | undefined {
  for (const locale of locales) {
    if (locale.id === selected) {
      return locale;
    }
  }

  return undefined;
}
