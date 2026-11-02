import type { SiteData } from '../content/content.types.ts';
import { localizedText } from '../content/localized-text.model.ts';

type BuildLabelContext = {
  locale: string;
  localized: SiteData['links']['locales'][string]['ui'];
  runID: string;
  runNumber: string;
};

export function buildLabel(context: BuildLabelContext): string {
  if (context.runID) {
    return `${localizedText(context.localized, context.locale, 'footer_workflow')} #${context.runNumber}`;
  }

  return localizedText(context.localized, context.locale, 'local_build');
}
