import type { RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { sitemap } from '#lib/features/metadata/resources.server.ts';

export async function GET(event: RequestEvent): Promise<Response> {
  const params = event.params;

  const data = await getSiteData();

  let localeExists = false;

  for (const language of data.links.language_options) {
    if (language.id === params.locale) {
      localeExists = true;
      break;
    }
  }

  if (!localeExists) {
    error(404, 'Unknown sitemap');
  }

  return new Response(sitemap(data, params.locale), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
}
