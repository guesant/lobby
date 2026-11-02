import type { SiteData } from './content.types.ts';
import { record, requiredText } from './validation.model.ts';

export function creditLicenses(
  value: unknown,
): SiteData['credits']['licenses'] {
  const licenses = record(value, 'credits.licenses');

  const validated: SiteData['credits']['licenses'] = {};

  for (const [
    id,
    rawLicense,
  ] of Object.entries(licenses)) {
    const license = record(rawLicense, `credits.licenses.${id}`);

    validated[id] = {
      name: requiredText(license['name'], `credits.licenses.${id}.name`),
      url: requiredText(license['url'], `credits.licenses.${id}.url`),
      text: requiredText(license['text'], `credits.licenses.${id}.text`),
    };
  }

  return validated;
}
