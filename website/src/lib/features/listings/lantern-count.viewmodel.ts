import type { PageLoadData } from '../content/content.types.ts';

export function lanternCount(data: PageLoadData): number {
  if (data.page.id !== 'home') {
    return 1;
  }

  let count = 1;

  for (const page of data.pages) {
    if (
      [
        'writing',
        'games',
        'now',
      ].includes(page.id)
    ) {
      count += 1;
    }
  }

  return count;
}
