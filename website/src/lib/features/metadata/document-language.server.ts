import type { SiteData } from '../content/content.types.ts';

export function documentLanguage(data: SiteData, language: string): string {
  return (
    data.links.locales[language]?.ui.html_lang ??
    data.links.locales['en']?.ui.html_lang ??
    'en'
  );
}
