import { requiredText } from '../content/validation.model.ts';
import type { EmptyAction } from './listing.types.ts';

export function emptyActionFor(input: {
  home: boolean;
  pageURL: string;
  homeURL: string;
  sectionID: string;
  linksCount: number;
  ui: Record<string, string>;
}): EmptyAction | undefined {
  const {
    home,
    pageURL,
    homeURL,
    sectionID,
    linksCount,
    ui
  } = input;

  if (linksCount > 0) {
    let href = `#links-${sectionID}`;

    if (home) {
      href = `${pageURL}#links-${sectionID}`;
    }

    return {
      href,
      label: requiredText(ui['related'], 'listing.ui.related'),
    };
  }

  if (!home) {
    return {
      href: homeURL,
      label: requiredText(ui['return_home'], 'listing.ui.return_home'),
    };
  }

  return undefined;
}
