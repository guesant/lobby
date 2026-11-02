import type { FederationItem } from './content.types.ts';

export function matchingFederationItems(
  items: FederationItem[],
  selected: FederationItem,
): FederationItem[] {
  const output: FederationItem[] = [];

  for (const item of items) {
    if (item.source === selected.source && item.id === selected.id) {
      output.push(item);
    }
  }

  return output;
}
