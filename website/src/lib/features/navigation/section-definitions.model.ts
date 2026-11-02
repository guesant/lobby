import type { LinkDocument, LinkRecord } from '../content/content.types.ts';

export function sectionDefinitions(configuration: LinkDocument): LinkRecord[] {
  const definitions: LinkRecord[] = [];

  for (const section of configuration.sections) {
    definitions.push(...section.links);
  }

  return definitions;
}
