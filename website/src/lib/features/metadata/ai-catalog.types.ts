import type { SearchItem } from '../search/search.model.ts';
import type { InterfaceName } from './resources.server.ts';

export type InterfaceURLs = Partial<Record<InterfaceName, string>>;

export type CatalogPage = {
  id: string;
  title: string;
  summary: string;
  type: string;
  language: string;
  urls: InterfaceURLs;
};

export type CatalogEntry = {
  id: string;
  title: string;
  summary: string;
  type: string;
  source: string;
  language: string;
  tags: string[];
  url: string;
  interface_urls?: InterfaceURLs;
  metadata?: SearchItem['metadata'];
  details_url?: string;
  details_label?: string;
};

export type CatalogLanguage = {
  id: string;
  label: string;
  html_lang: string;
  home_urls: InterfaceURLs;
};

export type AICatalog = {
  schema_version: 1;
  name: string;
  url: string;
  description: string;
  languages: CatalogLanguage[];
  interfaces: InterfaceName[];
  pages: CatalogPage[];
  entries: CatalogEntry[];
};

export type CatalogCandidate = {
  id: string;
  language: string;
  variants: {
    requestedLocale: string;
    interfaceName: InterfaceName;
    item: SearchItem;
  }[];
};
