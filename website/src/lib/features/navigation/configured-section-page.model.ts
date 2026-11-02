import type { LinkDocument, SectionRecord } from '../content/content.types.ts';
import { textOr } from '../content/text-or.model.ts';
import { isPublished } from './is-published.model.ts';
import { linksForSection } from './links-for-section.model.ts';
import type { ConfiguredPage } from './routes.types.ts';

type SectionPageContext = {
  configuration: LinkDocument;
  language: string;
  path: string;
  id: string;
};

export function configuredSectionPage(
  context: SectionPageContext,
): ConfiguredPage | undefined {
  let section: SectionRecord | undefined;

  for (const entry of context.configuration.sections) {
    if (entry.id === context.id) {
      section = entry;
      break;
    }
  }

  if (!section) {
    throw new Error('Unknown navigation section');
  }

  if (!isPublished(section)) {
    return undefined;
  }

  const label = section.labels[context.language];

  if (!label) {
    throw new Error(
      `Missing section language: ${context.id}:${context.language}`,
    );
  }

  return {
    id: context.id,
    type: 'links-page',
    title: label.title,
    description: label.description ?? '',
    url: `${context.path}${context.id}/`,
    icon: textOr(section.icon, 'book'),
    links: linksForSection(context.configuration, section),
  };
}
