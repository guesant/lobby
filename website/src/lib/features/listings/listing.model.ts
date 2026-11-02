import type { LinkDestination, LinkRecord } from '../content/content.types.ts';
import { requiredText } from '../content/validation.model.ts';

export type ListingDestination = (
  _item: Pick<LinkRecord, 'url' | 'target'>,
) => LinkDestination;

export type EmptyAction = {
  href: string;
  label: string;
};

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

export function itemHeadingLevel(level: 2 | 3 | 4): 3 | 4 | 5 {
  if (level === 2) {
    return 3;
  }

  if (level === 3) {
    return 4;
  }

  return 5;
}
