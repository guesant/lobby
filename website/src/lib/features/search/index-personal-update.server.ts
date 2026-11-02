import { textOr } from '../content/text-or.model.ts';
import { personalUpdatePage } from './personal-update-page.server.ts';
import type { SearchItem } from './search.types.ts';
import type { SearchContext } from './search-context.types.ts';

export function indexPersonalUpdate(context: SearchContext): SearchItem[] {
  const {
    data,
    locale,
    interfaceName,
    ui
  } = context;

  const nowPage = personalUpdatePage(data, locale, interfaceName);

  const now = data.links.now[locale] ?? data.links.now['en'];

  if (!now || !nowPage) {
    throw new Error(`Missing personal update: ${locale}`);
  }

  let language = 'en';

  if (data.links.now[locale]) {
    language = locale;
  }

  const output: SearchItem[] = [];

  for (const section of now.sections) {
    const group = textOr(ui['page'], nowPage.title);

    output.push({
      id: `now-${section.id}`,
      title: section.title,
      summary: section.description,
      url: `${nowPage.url}#now-${section.id}`,
      type: 'page',
      group,
      source: 'lobby',
      language,
      tags: [],
    });
  }

  return output;
}
