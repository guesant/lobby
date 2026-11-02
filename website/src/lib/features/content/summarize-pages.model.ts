import type { PageRecord } from './content.types.ts';
import { summarizePage } from './summarize-page.model.ts';

export function summarizePages(
  pages: PageRecord[],
): ReturnType<typeof summarizePage>[] {
  const summaries = [];

  for (const page of pages) {
    const summary = summarizePage(page);

    summaries.push(summary);
  }

  return summaries;
}
