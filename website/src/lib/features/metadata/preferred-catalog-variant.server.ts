import type { CatalogCandidate } from './ai-catalog.types.ts';

export function preferredCatalogVariant(
  variants: CatalogCandidate['variants'],
  language: string,
): CatalogCandidate['variants'][number] | undefined {
  let fallback: CatalogCandidate['variants'][number] | undefined;

  for (const variant of variants) {
    if (variant.requestedLocale === language) {
      return variant;
    }

    fallback ??= variant;
  }

  return fallback;
}
