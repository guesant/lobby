import { textOr } from '../content/text-or.model.ts';
import { activityDestination } from './activity-destination.server.ts';
import type { SearchItem } from './search.types.ts';
import type { SearchContext } from './search-context.types.ts';

const activityKeys = [
  'working',
  'building',
  'studying',
  'reading',
  'listening',
  'watching',
];

export function indexActivity(context: SearchContext): SearchItem[] {
  const {
    data,
    locale,
    interfaceName,
    ui
  } = context;

  const page = activityDestination(data, locale, interfaceName);

  if (!page) {
    throw new Error('Missing activity destination');
  }

  const activity = data.editorial.now[locale] ?? {};

  const output: SearchItem[] = [];

  for (const key of activityKeys) {
    const summary = activity[key];

    if (!summary) {
      continue;
    }

    const title = textOr(ui[key], key);

    const group = textOr(ui['page'], page.title);

    output.push({
      id: `now-activity-${key}`,
      title,
      summary,
      url: `${page.url}#now-activity-${key}`,
      type: 'page',
      group,
      source: 'lobby',
      language: locale,
      tags: [],
    });
  }

  return output;
}
