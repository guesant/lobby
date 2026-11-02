import type { SiteData } from './content.types.ts';
import { array, record, requiredText } from './validation.model.ts';

function creditLicenses(value: unknown): SiteData['credits']['licenses'] {
  const licenses = record(value, 'credits.licenses');

  const validatedLicenses: SiteData['credits']['licenses'] = {};

  for (const [
    id,
    rawLicense,
  ] of Object.entries(licenses)) {
    const license = record(rawLicense, `credits.licenses.${id}`);

    validatedLicenses[id] = {
      name: requiredText(license['name'], `credits.licenses.${id}.name`),
      url: requiredText(license['url'], `credits.licenses.${id}.url`),
      text: requiredText(license['text'], `credits.licenses.${id}.text`),
    };
  }

  return validatedLicenses;
}

export function validateCredits(value: unknown): SiteData['credits'] {
  const credits = record(value, 'credits data');

  const licenses = creditLicenses(credits['licenses']);

  const entries = array(credits['entries'], 'credits.entries')
    .map(
      (
        rawEntry,
        index,
      ): {
        id: string;
        name: string;
        authors: string;
        license: string;
        official_url: string;
      } => {
        const entry = record(rawEntry, `credits.entries[${String(index)}]`);

        return {
          id: requiredText(entry['id'], `credits.entries[${String(index)}].id`),
          name: requiredText(
            entry['name'],
            `credits.entries[${String(index)}].name`,
          ),
          authors: requiredText(
            entry['authors'],
            `credits.entries[${String(index)}].authors`,
          ),
          license: requiredText(
            entry['license'],
            `credits.entries[${String(index)}].license`,
          ),
          official_url: requiredText(
            entry['official_url'],
            `credits.entries[${String(index)}].official_url`,
          ),
        };
      },
    );

  const licenseIDs = new Set(Object.keys(licenses));

  for (const entry of entries) {
    if (!licenseIDs.has(entry.license)) {
      throw new Error(`Unknown credit license: ${entry.license}`);
    }
  }

  return {
    licenses,
    entries,
  };
}
