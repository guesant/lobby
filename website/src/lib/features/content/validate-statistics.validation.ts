import type { SiteData } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { validateNumericMap } from './validate-numeric-map.validation.ts';
import { record, requiredText } from './validation.model.ts';

export function validateStatistics(value: unknown): SiteData['statistics'] {
  const statistics = record(value, 'statistics data');

  const output: SiteData['statistics'] = {};

  for (const [
    id,
    rawEntry,
  ] of Object.entries(statistics)) {
    const entry = record(rawEntry, `statistics.${id}`);

    const metrics = validateNumericMap(
      entry['metrics'],
      `statistics.${id}.metrics`,
    );

    let available: Record<string, number> | undefined;

    if (entry['available'] !== undefined) {
      available = validateNumericMap(
        entry['available'],
        `statistics.${id}.available`,
      );
    }

    output[id] = {
      username: requiredText(entry['username'], `statistics.${id}.username`),
      profile_url: requiredText(
        entry['profile_url'],
        `statistics.${id}.profile_url`,
      ),
      provider: requiredText(entry['provider'], `statistics.${id}.provider`),
      updated_at: requiredText(
        entry['updated_at'],
        `statistics.${id}.updated_at`,
      ),
      metrics,
      ...optionalProperty('available', available),
    };
  }

  return output;
}
