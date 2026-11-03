import type { PageLoadData } from '../content/content.types.ts';
import type { LanguagePageData } from './language.types.ts';

export type NavigationPresentation = LanguagePageData &
  Pick<PageLoadData, 'page' | 'localized'>;
