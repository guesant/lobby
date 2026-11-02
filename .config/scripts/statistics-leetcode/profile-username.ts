import type { LinkRecord } from '../../../website/src/lib/features/content/content.types.ts';
import { requiredText } from '../../../website/src/lib/features/content/validation.model.ts';

export function profileUsername(entry: Pick<LinkRecord, 'url'>): string {
  const url = new URL(requiredText(entry.url, 'LeetCode profile URL'));

  const parts = url.pathname.split('/')
    .filter(Boolean);

  const username = parts[1];

  if (
    url.hostname !== 'leetcode.com' ||
    parts[0] !== 'u' ||
    parts.length !== 2 ||
    !username
  ) {
    throw new Error('LeetCode statistics require a profile URL');
  }

  return username;
}
