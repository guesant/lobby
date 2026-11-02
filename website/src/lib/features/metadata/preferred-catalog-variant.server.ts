import type { CatalogCandidate } from './ai-catalog.types.ts';
import type { InterfaceName } from './resource.types.ts';

export function preferredCatalogVariant(
  variants: CatalogCandidate['variants'],
  interfaceName: InterfaceName,
  language: string,
): CatalogCandidate['variants'][number] | undefined {
  let fallback: CatalogCandidate['variants'][number] | undefined;

  for (const variant of variants) {
    if (variant.interfaceName !== interfaceName) {
      continue;
    }

    if (variant.requestedLocale === language) {
      return variant;
    }

    fallback ??= variant;
  }

  return fallback;
}
