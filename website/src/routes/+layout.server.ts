import { getSiteData } from '#lib/features/content/content.server.ts';
import type { ErrorLocale } from '#lib/features/navigation/not-found.model.ts';
import { errorLocales } from '#lib/features/navigation/not-found.model.ts';

export async function load(): Promise<{
  errorPresentation: ErrorLocale[];
}> {
  return {
    errorPresentation: errorLocales(await getSiteData()),
  };
}
