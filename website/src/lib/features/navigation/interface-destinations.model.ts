import type { PageLoadData } from '../content/content.types.ts';
import type { PageContext } from './page.types.ts';
import { pageDestination } from './page-destination.model.ts';

export function interfaceDestinations(
  context: PageContext,
): Pick<
  PageLoadData,
  'standardHomeURL' | 'standardPageURL' | 'terminalPageURL'
> {
  let home: PageContext['page'] | undefined;

  for (const page of context.standardPages) {
    if (page.id === 'home') {
      home = page;
      break;
    }
  }

  if (!home || !context.standardPages.length || !context.terminalPages.length) {
    throw new Error('Missing localized interface destinations');
  }

  return {
    standardHomeURL: home.url,
    standardPageURL: pageDestination(context.standardPages, context.page.id),
    terminalPageURL: pageDestination(context.terminalPages, context.page.id),
  };
}
