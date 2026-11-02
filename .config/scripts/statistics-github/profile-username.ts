import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';

export function profileUsername(entry: Pick<LinkRecord, 'url'>): string {
  const url = new URL(requiredText(entry.url, 'GitHub profile URL'));

  const parts = url.pathname.split('/')
    .filter(Boolean);

  const username = parts[0];

  if (url.hostname !== 'github.com' || parts.length !== 1 || !username) {
    throw new Error('GitHub statistics require a profile URL');
  }

  return username;
}
