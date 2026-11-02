import type { SiteData } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import { record, requiredText } from './validation.model.ts';

function validateNumericMap(
  value: unknown,
  label: string,
): Record<string, number> {
  const source = record(value, label);

  const output: Record<string, number> = {};

  for (const [
    key,
    entry,
  ] of Object.entries(source)) {
    if (typeof entry !== 'number' || !Number.isFinite(entry) || entry < 0) {
      throw new Error(
        `Invalid ${label}.${key}: expected a non-negative number`,
      );
    }

    output[key] = entry;
  }

  return output;
}

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

    function resolveAvailable(): Record<string, number> | undefined {
      if (entry['available'] === undefined) {
        return undefined;
      }

      return validateNumericMap(
        entry['available'],
        `statistics.${id}.available`,
      );
    }

    const available = resolveAvailable();

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
