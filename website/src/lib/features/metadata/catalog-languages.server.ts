import type { SiteData } from '../content/content.types.ts';
import type { CatalogLanguage } from './ai-catalog.types.ts';
import { absoluteURL } from './catalog-context.server.ts';

export function catalogLanguages(data: SiteData): CatalogLanguage[] {
  const output: CatalogLanguage[] = [];

  for (const language of data.links.language_options) {
    const localization = data.links.locales[language.id];

    if (!localization) {
      throw new Error(`Missing AI catalog localization: ${language.id}`);
    }

    const homeURL = absoluteURL(language.path);

    const terminalPath = `${language.path}terminal/`;

    const terminalURL = absoluteURL(terminalPath);

    const homeURLs = {
      voxel: homeURL,
      terminal: terminalURL,
    };

    output.push({
      id: language.id,
      label: language.label,
      html_lang: localization.ui.html_lang,
      home_urls: homeURLs,
    });
  }

  return output;
}
