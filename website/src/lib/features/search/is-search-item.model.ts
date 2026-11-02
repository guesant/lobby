import { requiredSearchFieldsValid } from './required-search-fields-valid.model.ts';
import { safeSearchURL } from './safe-search-url.model.ts';
import type { SearchItem } from './search.types.ts';
import { stringList } from './string-list.model.ts';
import { validMetadata } from './valid-metadata.model.ts';
import { validSearchDetails } from './valid-search-details.model.ts';

export function isSearchItem(value: unknown): value is SearchItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  const fields = [
    'id',
    'title',
    'summary',
    'url',
    'group',
    'source',
    'language',
    'type',
  ];

  return (
    requiredSearchFieldsValid(item, fields) &&
    stringList(item['tags']) &&
    safeSearchURL(item['url']) &&
    validSearchDetails(item) &&
    validMetadata(item['metadata'])
  );
}
