import { getSiteData } from '$lib/site-data.server.ts';
import { errorLocales } from '$lib/not-found.ts';
import type { ErrorLocale } from '$lib/not-found.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (): Promise<{
  errorPresentation: ErrorLocale[];
}> => {
  return {
    errorPresentation: errorLocales(await getSiteData()),
  };
};
