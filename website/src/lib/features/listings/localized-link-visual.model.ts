import type { DisplayLinkRecord } from '../content/content.types.ts';
import { localizedText } from '../content/localized-text.model.ts';
import type { ConfiguredLink } from './links.types.ts';

export function localizedLinkVisual(
  visual: ConfiguredLink['visual'],
  locale: string,
): DisplayLinkRecord['visual'] {
  if (!visual) {
    return undefined;
  }

  return {
    ...visual,
    alt: localizedText(visual.alt, locale),
  };
}
