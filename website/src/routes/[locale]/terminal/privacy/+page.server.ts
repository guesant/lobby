import type { PageLoadData } from '../../../../lib/features/content/content.types.ts';
import { loadPrivacyPageData } from '../../../../lib/features/privacy/load-privacy-page-data.server.ts';
import type { PageServerLoadEvent } from './$types';

export { privacyEntries as entries } from '../../../../lib/features/privacy/privacy-entries.server.ts';

export async function load(event: PageServerLoadEvent): Promise<PageLoadData> {
  const locale = event.params.locale;

  return loadPrivacyPageData(locale, 'terminal');
}
