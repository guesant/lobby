import type { SiteData } from '../content/content.types.ts';
import { requiredText } from '../content/required-text.model.ts';

type BuildLabelContext = {
  locale: string;
  localized: SiteData['links']['locales'][string]['ui'];
  runID: string;
  runNumber: string;
};

export function buildLabel(context: BuildLabelContext): string {
  if (context.runID) {
    const workflowLabel = requiredText(
      context.localized['footer_workflow'],
      `links.locales.${context.locale}.ui.footer_workflow`,
    );

    return `${workflowLabel} #${context.runNumber}`;
  }

  return requiredText(
    context.localized['local_build'],
    `links.locales.${context.locale}.ui.local_build`,
  );
}
