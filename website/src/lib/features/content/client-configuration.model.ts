import type { PageLoadData, SiteData } from './content.types.ts';

export function clientConfiguration(data: SiteData): PageLoadData['config'] {
  return {
    profile: data.links.profile,
    theme: {
      appearance: data.links.theme.appearance,
      animations_enabled: data.links.theme.animations_enabled,
    },
    navigation: {
      home: data.links.navigation.home,
    },
    site: data.links.site,
    language_preference: data.links.language_preference,
  };
}
