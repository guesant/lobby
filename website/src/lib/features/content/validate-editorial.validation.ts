import type { SiteData } from './content.types.ts';
import { validateEditorialEntries } from './validate-editorial-entries.validation.ts';
import { validateEditorialLocales } from './validate-editorial-locales.validation.ts';
import { record } from './validation.model.ts';

export function validateEditorial(value: unknown): SiteData['editorial'] {
  const editorial = record(value, 'editorial data');

  const rawEntries = record(editorial['entries'], 'editorial.entries');

  const rawUI = record(editorial['ui'], 'editorial.ui');

  const rawNow = record(editorial['now'], 'editorial.now');

  const entries = validateEditorialEntries(rawEntries);

  const ui = validateEditorialLocales(rawUI, 'editorial.ui');

  const now = validateEditorialLocales(rawNow, 'editorial.now');

  return {
    entries,
    ui,
    now,
  };
}
