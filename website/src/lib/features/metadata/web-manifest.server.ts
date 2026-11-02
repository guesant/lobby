import type { SiteData } from '../content/content.types.ts';
import type { InterfaceName, WebManifest } from './resource.types.ts';

export function webManifest(
  data: SiteData,
  locale: string,
  interfaceName: InterfaceName,
): WebManifest {
  const localized = data.links.locales[locale];

  if (!localized) {
    throw new Error('Missing manifest locale');
  }

  let start = '/' + locale + '/';

  if (interfaceName === 'terminal') {
    start += 'terminal/';
  }

  return {
    name: localized.seo.title,
    short_name: 'Lobby',
    description: localized.seo.description,
    start_url: start,
    scope: '/',
    display: 'standalone',
    background_color: '#1b1b18',
    theme_color: '#38651f',
    lang: localized.ui.html_lang,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
