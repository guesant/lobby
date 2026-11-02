import { editorialEntryAction } from './editorial-entry-action.viewmodel.ts';
import { editorialGroups } from './editorial-groups.viewmodel.ts';
import { editorialListKinds } from './editorial-list-kinds.viewmodel.ts';
import type {
  EditorialListInput,
  EditorialListPresentation,
} from './editorial-presentation.types.ts';

export function editorialListPresentation(
  input: EditorialListInput,
): EditorialListPresentation {
  const kinds = editorialListKinds(input.items, input.sectionID);

  const groups = editorialGroups(kinds, input.items);

  const visible = [];

  const missing: string[] = [];

  for (const group of groups) {
    if (group.items.length > 0) {
      visible.push(group);
    } else {
      missing.push(group.type);
    }
  }

  return {
    groups: visible,
    missing,
    fallback: editorialEntryAction(input.emptyAction?.href, input.destination),
  };
}
