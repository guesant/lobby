import type { EditorialRecord } from '../content/content.types.ts';
import { editorialEntryAction } from './editorial-entry-action.viewmodel.ts';
import { editorialEntryIcon } from './editorial-entry-icon.viewmodel.ts';
import { editorialMetadataValue } from './editorial-metadata-value.viewmodel.ts';
import { editorialOrigin } from './editorial-origin.viewmodel.ts';
import type {
  EditorialEntryContext,
  EditorialEntryPresentation,
} from './editorial-presentation.types.ts';
import type { ListingDestination } from './listing.model.ts';
import { visibleEditorialMetadata } from './visible-editorial-metadata.viewmodel.ts';

export function editorialEntryPresentation(
  item: EditorialRecord,
  destination: ListingDestination,
  context: EditorialEntryContext,
): EditorialEntryPresentation {
  const metadata: EditorialEntryPresentation['metadata'] = [];

  for (const [
    key,
    value,
  ] of Object.entries(item.metadata)) {
    if (!value || !visibleEditorialMetadata(item, key)) {
      continue;
    }

    const metadataValue = editorialMetadataValue(value);

    const entry = {
      key,
      value: metadataValue,
    };

    metadata.push(entry);
  }

  return {
    primary: editorialEntryAction(item.url, destination),
    secondary: editorialEntryAction(item.details_url, destination),
    icon: editorialEntryIcon(item),
    origin: editorialOrigin(item, context),
    metadata,
  };
}
