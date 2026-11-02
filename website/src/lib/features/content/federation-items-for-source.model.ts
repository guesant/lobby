import type { FederationItem } from './content.types.ts';

export function federationItemsForSource(
  items: FederationItem[],
  source: string,
): FederationItem[] {
  const output: FederationItem[] = [];

  for (const item of items) {
    if (item.source === source) {
      output.push(item);
    }
  }

  return output;
}
