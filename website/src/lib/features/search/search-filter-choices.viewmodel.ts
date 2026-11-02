import type { PageLoadData } from '../content/content.types.ts';
import type { SearchFilters, SearchItem } from './search.types.ts';
import { searchOptionLabel } from './search-option-label.viewmodel.ts';
import type { FilterChoice } from './search-viewmodel.types.ts';

export function searchFilterChoices(
  index: SearchItem[],
  page: PageLoadData,
): FilterChoice[] {
  const keys: (keyof SearchFilters)[] = [
    'source',
    'type',
    'language',
  ];

  const output: FilterChoice[] = [];

  for (const key of keys) {
    const values = new Set<string>();

    for (const entry of index) {
      values.add(entry[key]);
    }

    const options: FilterChoice['options'] = [];

    for (const value of [
      ...values,
    ].sort()) {
      const label = searchOptionLabel(key, value, page);

      options.push({
        value,
        label,
      });
    }

    output.push({
      key,
      label: page.editorialUI[`search_${key}`] ?? '',
      options,
    });
  }

  return output;
}
