import type { SiteData } from '../content/content.types.ts';
import { preferenceOptions } from '../preferences/preferences.model.ts';
import { documentPresentation } from './document-presentation.server.ts';

export function renderDocument(html: string, data: SiteData, url: URL): string {
  const presentation = documentPresentation(data, url);

  const serializedPreferences = JSON.stringify(preferenceOptions);

  return html
    .replace('__PREFERENCE_OPTIONS__', serializedPreferences)
    .replace('__LANG__', presentation.language)
    .replace('__INTERFACE__', presentation.interfaceName)
    .replace('__PAGE__', presentation.page)
    .replace('__BODY_CLASS__', presentation.bodyClass)
    .replace('__EARLY_HEAD__', presentation.earlyHead);
}
