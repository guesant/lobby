import type { LinkDocument } from './content.types.ts';
import { personalUpdate } from './personal-update.validation.ts';
import { record } from './validation.model.ts';

export function personalUpdates(value: unknown): LinkDocument['now'] {
  const raw = record(value, 'links.now');

  const now: LinkDocument['now'] = {};

  for (const [
    language,
    content,
  ] of Object.entries(raw)) {
    now[language] = personalUpdate(content, `links.now.${language}`);
  }

  return now;
}
