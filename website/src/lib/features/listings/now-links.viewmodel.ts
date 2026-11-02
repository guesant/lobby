import type {
  DisplayLinkRecord,
  PageLoadData,
  PageRecord,
} from '../content/content.types.ts';

export function nowLinks(
  entry: PageRecord,
  data: PageLoadData,
): DisplayLinkRecord[] {
  const output: DisplayLinkRecord[] = [];

  for (const section of data.now.sections) {
    output.push({
      id: `now-${section.id}`,
      title: section.title,
      url: `${entry.url}#now-${section.id}`,
      icon: 'clock',
      language: data.locale,
    });
  }

  return output;
}
