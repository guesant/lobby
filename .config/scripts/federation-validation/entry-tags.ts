import { array } from '../../../website/src/lib/features/content/validation.model.ts';
import { text } from './text.ts';

export function entryTags(value: unknown): string[] {
  const tags = array(value, 'federation tags');

  if (tags.length > 100) {
    throw new Error('Invalid federation tags');
  }

  const result: string[] = [];

  for (const tag of tags) {
    const normalizedTag = text(tag, 200);

    result.push(normalizedTag);
  }

  return result;
}
