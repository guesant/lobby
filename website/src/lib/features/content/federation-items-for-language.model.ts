import type { FederationItem } from './content.types.ts';

export function federationItemsForLanguage(
  items: FederationItem[],
  language: string,
): FederationItem[] {
  const output: FederationItem[] = [];

  for (const item of items) {
    if (item.language === language) {
      output.push(item);
    }
  }

  return output;
}
