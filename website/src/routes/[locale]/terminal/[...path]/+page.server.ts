import type { PageServerLoadEvent } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getSiteData } from '#lib/features/content/content.server.ts';
import { pagesFor } from '#lib/features/navigation/catalog.model.ts';
import { knownLocale } from '#lib/features/navigation/known-locale.model.ts';
import { privacyPageURL } from '#lib/features/privacy/privacy-page-url.model.ts';

export { terminalEntries as entries } from '#lib/features/navigation/entries.server.ts';

export async function load(event: PageServerLoadEvent): Promise<never> {
  const locale = event.params.locale;

  const path = event.params.path.replace(/\/+$/, '');

  const data = await getSiteData();

  if (!knownLocale(data, locale)) {
    error(404, 'Page not found');
  }

  if (path === 'privacy') {
    const destination = privacyPageURL(locale);

    redirect(308, destination);
  }

  const pageID = path || 'home';

  for (const page of pagesFor(data, locale)) {
    if (page.id === pageID && !page.fallback) {
      redirect(308, page.url);
    }
  }

  error(404, 'Page not found');
}
