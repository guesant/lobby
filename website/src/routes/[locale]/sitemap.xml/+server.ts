import type { EntryGenerator, RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { sitemap } from '#lib/features/metadata/resources.server.ts';

export const prerender = true;

export const trailingSlash = 'never';

export async function entries(): Promise<Awaited<ReturnType<EntryGenerator>>> {
  const data = await getSiteData();

  return data.links.language_options.map(
    (
      language,
    ): {
      locale: string;
    } => {
      return {
        locale: language.id,
      };
    },
  );
}

export async function GET(event: RequestEvent): Promise<Response> {
  const params = event.params;

  const data = await getSiteData();

  if (
    !data.links.language_options.some((language): boolean => {
      return language.id === params.locale;
    })
  ) {
    error(404, 'Unknown sitemap');
  }

  return new Response(sitemap(data, params.locale), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
}
