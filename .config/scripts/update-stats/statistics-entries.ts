import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import { readConfiguration } from '../configuration.ts';

export function statisticsEntries(configurationPath: string): LinkRecord[] {
  const entries: LinkRecord[] = [];

  for (const section of readConfiguration(configurationPath).sections) {
    if (section.enabled === false || section.public === false) {
      continue;
    }

    for (const entry of section.links) {
      if (entry.enabled !== false && entry.public !== false && entry.stats) {
        entries.push(entry);
      }
    }
  }

  return entries;
}
