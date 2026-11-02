import type { Publication } from './routes.types.ts';

export function isPublished(entry: Publication): boolean {
  return (
    entry.enabled !== false &&
    entry.public !== false &&
    !entry.private &&
    !entry.draft
  );
}
