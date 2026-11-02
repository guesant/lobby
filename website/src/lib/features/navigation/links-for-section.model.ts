import type {
  LinkDocument,
  LinkRecord,
  SectionRecord,
} from '../content/content.types.ts';
import { isPublished } from './is-published.model.ts';
import { sectionDefinitions } from './section-definitions.model.ts';
import { sectionLinkIDs } from './section-link-ids.model.ts';
import { sectionLinksForIDs } from './section-links-for-ids.model.ts';
import { visibleLinks } from './visible-links.model.ts';

export function linksForSection(
  configuration: LinkDocument,
  section: SectionRecord,
): LinkRecord[] {
  if (!isPublished(section)) {
    return [];
  }

  const definitions = sectionDefinitions(configuration);

  const ids = sectionLinkIDs(section, definitions);

  const availableLinks = visibleLinks(configuration);

  return sectionLinksForIDs(ids, availableLinks);
}
