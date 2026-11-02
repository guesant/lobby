import type { SiteData } from '../content/content.types.ts';

export type InterfaceName = 'minecraft' | 'terminal';

export type ResourceIdentity = {
  locale: string;
  interfaceName: InterfaceName;
};

export type ResourcePresenter = (
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
) => unknown;

export type WebManifest = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  lang: string | undefined;
  icons: {
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }[];
};
