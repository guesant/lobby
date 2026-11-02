import { record } from '../../../website/src/lib/features/content/validation.model.ts';
import { integer } from '../statistics-request.ts';

export function countFor(entries: unknown[], difficulty: string): number {
  for (const entry of entries) {
    const item = record(entry, 'LeetCode count');

    if (item['difficulty'] === difficulty) {
      return integer(item['count']);
    }
  }

  return 0;
}
