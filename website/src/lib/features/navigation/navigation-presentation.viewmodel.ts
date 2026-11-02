import type { PageLoadData } from '../content/content.types.ts';
import { languagePageData } from './language-page-data.viewmodel.ts';
import type { NavigationPresentation } from './navigation-presentation.types.ts';

export function navigationPresentation(
  data: Partial<PageLoadData>,
  status: number,
): NavigationPresentation | null {
  const language = languagePageData(data);

  if (!language || status >= 400 || !data.localized || !data.page) {
    return null;
  }

  return {
    ...language,
    localized: data.localized,
    page: data.page,
  };
}
