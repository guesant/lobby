import type { SiteData } from '../content/content.types.ts';

export type ErrorLocale = {
  id: string;
  name: string;
  home: string;
  title: string;
  description: string;
  errorTitle: string;
  errorDescription: string;
  homeLabel: string;
  languagesLabel: string;
};

export function errorAppearance(appearance: unknown): string {
  if (appearance === 'light' || appearance === 'dark') {
    return appearance;
  }

  return 'system';
}

export function errorLocales(data: SiteData): ErrorLocale[] {
  return data.links.language_options.map((language): ErrorLocale => {
    const ui = data.editorial.ui[language.id];

    if (
      !ui?.['not_found_title'] ||
      !ui['not_found_description'] ||
      !ui['not_found_home'] ||
      !ui['not_found_languages'] ||
      !ui['error_title'] ||
      !ui['error_description']
    ) {
      throw new Error(`Missing 404 labels: ${language.id}`);
    }

    return {
      id: language.id,
      name: language.label,
      home: language.path,
      title: ui['not_found_title'],
      description: ui['not_found_description'],
      errorTitle: ui['error_title'],
      errorDescription: ui['error_description'],
      homeLabel: ui['not_found_home'],
      languagesLabel: ui['not_found_languages'],
    };
  });
}
