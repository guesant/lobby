import type { RequestHandler } from './$types';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { publicProfile } from '#lib/features/profile/public-profile.server.ts';
import { stringify } from 'yaml';

export const prerender = true;

export const trailingSlash = 'never';

export async function GET(): Promise<Awaited<ReturnType<RequestHandler>>> {
  const data = await getSiteData();

  const profile = publicProfile(data);

  const document = stringify(profile);

  return new Response(document, {
    headers: {
      'content-type': 'application/yaml; charset=utf-8',
    },
  });
}
