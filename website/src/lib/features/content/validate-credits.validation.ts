import type { SiteData } from './content.types.ts';
import { creditLicenses } from './credit-licenses.validation.ts';
import type { CreditEntry } from './validate-credit-entry.validation.ts';
import { validateCreditEntry } from './validate-credit-entry.validation.ts';
import { array, record } from './validation.model.ts';

export function validateCredits(value: unknown): SiteData['credits'] {
  const credits = record(value, 'credits data');

  const licenses = creditLicenses(credits['licenses']);

  const entries: CreditEntry[] = [];

  for (const [
    index,
    rawEntry,
  ] of array(credits['entries'], 'credits.entries')
      .entries()) {
    const entry = validateCreditEntry(rawEntry, index);

    entries.push(entry);
  }

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
