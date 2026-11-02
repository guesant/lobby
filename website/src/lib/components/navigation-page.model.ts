import type { PageRecord } from '../features/content/content.types.ts';

export function navigationPage(
  nowShortcut: boolean,
  entry: PageRecord,
): string | undefined {
  if (nowShortcut) {
    return undefined;
  }

  return entry.id;
}
