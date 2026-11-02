import type { ErrorLocale } from './not-found.types.ts';

export function errorHomeURL(locale: ErrorLocale, terminal: boolean): string {
  if (terminal) {
    return `${locale.home}terminal/`;
  }

  return locale.home;
}
