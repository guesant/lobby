import { text } from './text.ts';

export function publicTitle(entry: Record<string, unknown>): string {
  if (
    entry['private'] ||
    entry['draft'] ||
    entry['public'] === false ||
    entry['enabled'] === false
  ) {
    throw new Error('Nonpublic federation entry');
  }

  const title = text(entry['title'], 1000);

  if (!title.trim()) {
    throw new Error('Missing federation title');
  }

  return title;
}
