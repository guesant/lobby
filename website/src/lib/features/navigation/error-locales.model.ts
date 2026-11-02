import type { SiteData } from '../content/content.types.ts';
import type { ErrorLocale } from './not-found.types.ts';
import { requiredErrorLabels } from './required-error-labels.model.ts';

export function errorLocales(data: SiteData): ErrorLocale[] {
  const locales: ErrorLocale[] = [];

  for (const language of data.links.language_options) {
    const ui = data.editorial.ui[language.id];

    if (!ui) {
      throw new Error(`Missing 404 labels: ${language.id}`);
    }

    const labels = requiredErrorLabels(ui, language.id);

    locales.push({
      id: language.id,
      name: language.label,
      home: language.path,
      title: labels.not_found_title,
      description: labels.not_found_description,
      errorTitle: labels.error_title,
      errorDescription: labels.error_description,
      homeLabel: labels.not_found_home,
      languagesLabel: labels.not_found_languages,
    });
  }

  return locales;
}
