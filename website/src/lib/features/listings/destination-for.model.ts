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
  return resolveDestination(context.config.site, item, context.origin);
}
