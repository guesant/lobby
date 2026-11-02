import { text } from './text.ts';

export function entryIdentity(
  entry: Record<string, unknown>,
  ids: Set<string>,
): {
  id: string;
  language: string;
} {
  const id = text(entry['id'], 128);

  if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(id)) {
    throw new Error('Invalid federation identity');
  }

  const language = text(entry['language'], 20)
    .toLowerCase()
    .replaceAll('_', '-');

  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(language)) {
    throw new Error('Invalid federation language');
  }

  const key = `${id}:${language}`;

  if (ids.has(key)) {
    throw new Error(`Duplicate federation entry: ${key}`);
  }

  ids.add(key);

  return {
    id,
    language,
  };
}
