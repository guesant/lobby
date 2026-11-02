import type { FederationItem } from './content.types.ts';

export function preferredFederationItem(
  items: FederationItem[],
  locale: string,
): FederationItem | undefined {
  let fallback: FederationItem | undefined;

  for (const item of items) {
    if (item.language === locale) {
      return item;
    }

    if (item.language === 'en') {
      fallback ??= item;
    }
  }

  return fallback ?? items[0];
}
