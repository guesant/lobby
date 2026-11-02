import { resolveDestination } from '../content/content.model.ts';
import type {
  DestinationContext,
  DestinationInput,
  PresentationDestination,
} from './presentation.types.ts';

export function destinationFor(
  context: DestinationContext,
  item: DestinationInput,
): PresentationDestination {
  const destination = resolveDestination(
    context.config.site,
    item,
    context.origin,
  );

  let href = destination.href;

  if (!destination.external && context.interfaceName === 'terminal') {
    const prefix = `/${context.locale}/`;

    if (href.startsWith(prefix) && !href.startsWith(`${prefix}terminal/`)) {
      let suffix = href.slice(prefix.length);

      if (suffix === 'agora/') {
        suffix = 'now/';
      }

      href = `${prefix}terminal/${suffix}`;
    }
  }

  return {
    ...destination,
    href,
  };
}
