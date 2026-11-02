import type { PageRecord } from './content.types.ts';

export function summarizePage(entry: PageRecord): PageRecord {
  const summary = {
    ...entry,
  };

  delete summary.section;
  delete summary.links;

  return summary;
}
