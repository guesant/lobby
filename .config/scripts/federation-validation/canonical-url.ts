import type { Source } from '../federation.types.ts';
import { text } from './text.ts';

export function canonicalURL(value: unknown, source: Source): string {
  const url = new URL(text(value, 2048));

  if (
    url.origin !== source.origin ||
    url.username ||
    url.password ||
    url.protocol !== 'https:'
  ) {
    throw new Error('Invalid federation canonical URL');
  }

  return url.href;
}
