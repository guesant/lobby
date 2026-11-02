import type { PageLoadData } from '../content/content.types.ts';

export type LanguagePageData = Pick<
  PageLoadData,
  'config' | 'interfaceName' | 'isLanguageEntry' | 'locale' | 'languageRoutes'
>;

export type LanguageRoute = {
  id: string;
  home: string;
  url: string;
};

export type LanguageContext = {
  routes: LanguageRoute[];
  default: string;
  current: string;
  neutral: boolean;
};

export type LanguagePage = {
  context: LanguageContext;
  url: URL;
};
