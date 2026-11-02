import type { LinkRecord } from './content.types.ts';
import type { UnknownRecord } from './validation.model.ts';
import { optionalBoolean } from './validation.model.ts';

export function publicationFlags(
  source: UnknownRecord,
  label: string,
): Pick<LinkRecord, 'enabled' | 'public' | 'private' | 'draft' | 'featured'> {
  const flags: Pick<
    LinkRecord,
    'enabled' | 'public' | 'private' | 'draft' | 'featured'
  > = {};

  for (const key of [
    'enabled',
    'public',
    'private',
    'draft',
    'featured',
  ] as const) {
    const value = optionalBoolean(source[key], `${label}.${key}`);

    if (value !== undefined) {
      flags[key] = value;
    }
  }

  return flags;
}
