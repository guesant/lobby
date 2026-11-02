import type { LinkRecord } from '../content/content.types.ts';

export function hasLinkDefinition(
  id: string,
  definitions: LinkRecord[],
): boolean {
  for (const entry of definitions) {
    if (entry.id === id) {
      return true;
    }
  }

  return false;
}
