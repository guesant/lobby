import { array } from '../../../website/src/lib/features/content/validation.model.ts';
import { text } from './text.ts';

export function metadataCategories(value: unknown): string[] {
  const categories: string[] = [];

  for (const item of array(value, 'categories')) {
    const category = text(item, 200);

    categories.push(category);
  }

  return categories;
}
