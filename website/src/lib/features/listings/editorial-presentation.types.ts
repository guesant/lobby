import type {
  EditorialRecord,
  LinkDestination,
} from '../content/content.types.ts';
import type { EmptyAction, ListingDestination } from './listing.types.ts';

export type EditorialGroup = {
  type: string;
  items: EditorialRecord[];
};

export type EditorialListInput = {
  items: EditorialRecord[];
  sectionID: string;
  destination: ListingDestination;
  emptyAction: EmptyAction | undefined;
};

export type EditorialListPresentation = {
  groups: EditorialGroup[];
  missing: string[];
  fallback: LinkDestination | undefined;
};

export type EditorialEntryPresentation = {
  primary: LinkDestination | undefined;
  secondary: LinkDestination | undefined;
  icon: string | undefined;
  origin: string;
  metadata: {
    key: string;
    value: string;
  }[];
};

export type EditorialEntryContext = {
  locale: string;
  languageLabel: string;
};
