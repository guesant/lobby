import type { PageLoadData } from '../features/content/content.types.ts';
import { languageContext } from '../features/navigation/language.model.ts';
import type { LanguagePage } from '../features/navigation/language.types.ts';
import { navigationPresentation } from '../features/navigation/navigation.viewmodel.ts';
import { page } from '$app/state';

export function currentLanguagePage(): LanguagePage | null {
  const presentation = navigationPresentation(
    page.data as PageLoadData,
    page.status,
  );

  if (!presentation) {
    return null;
  }

  return {
    context: languageContext(presentation),
    url: new URL(window.location.href),
  };
}
