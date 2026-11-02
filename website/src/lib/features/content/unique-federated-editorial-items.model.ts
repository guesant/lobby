import type { EditorialRecord, FederationItem } from './content.types.ts';
import { editorialKinds } from './editorial-kinds.model.ts';
import { matchingFederationItems } from './matching-federation-items.model.ts';
import { preferredFederationItem } from './preferred-federation-item.model.ts';

export function uniqueFederatedEditorialItems(
  candidates: FederationItem[],
  sectionID: string,
  locale: string,
): EditorialRecord[] {
  const seen = new Set<string>();

  const output: EditorialRecord[] = [];

  for (const item of candidates) {
    const identity = `${item.source}-${item.id}`;

    if (!editorialKinds[sectionID]?.includes(item.type) || seen.has(identity)) {
      continue;
    }

    const matching = matchingFederationItems(candidates, item);

    const selected = preferredFederationItem(matching, locale);

    if (selected) {
      output.push(selected);
      seen.add(identity);
    }
  }

  return output;
}
