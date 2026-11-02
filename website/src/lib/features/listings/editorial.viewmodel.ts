import type {
  EditorialRecord,
  LinkDestination,
} from '../content/content.types.ts';
import { editorialKinds } from '../content/editorial.model.ts';
import type { EmptyAction, ListingDestination } from './listing.model.ts';

type EditorialGroup = {
  type: string;
  items: EditorialRecord[];
};

type EditorialListInput = {
  items: EditorialRecord[];
  sectionID: string;
  destination: ListingDestination;
  emptyAction: EmptyAction | undefined;
};

type EditorialListPresentation = {
  groups: EditorialGroup[];
  missing: string[];
  fallback: LinkDestination | undefined;
};

type EditorialEntryPresentation = {
  primary: LinkDestination | undefined;
  secondary: LinkDestination | undefined;
  icon: string | undefined;
  origin: string;
  metadata: {
    key: string;
    value: string;
  }[];
};

type EditorialEntryContext = {
  locale: string;
  interfaceName: 'minecraft' | 'terminal';
  languageLabel: string;
};

function editorialOrigin(
  item: EditorialRecord,
  context: EditorialEntryContext,
): string {
  if (context.interfaceName === 'terminal') {
    if (item.language === context.locale) {
      return item.source;
    }

    return `${item.source}· ${context.languageLabel}: ${item.language}`;
  }

  if (item.language === context.locale) {
    return '';
  }

  return `${context.languageLabel}: ${item.language}`;
}

function entryAction(
  url: string | undefined,
  destination: ListingDestination,
): LinkDestination | undefined {
  if (!url) {
    return undefined;
  }

  return destination({
    url,
  });
}

function entryIcon(item: EditorialRecord): string | undefined {
  if (item.type === 'project') {
    return 'code';
  }

  return undefined;
}

function visibleMetadata(item: EditorialRecord, key: string): boolean {
  if (key === 'content_url') {
    return false;
  }

  if (item.type === 'experience' && key === 'position') {
    return false;
  }

  return item.type !== 'education' || key !== 'degree';
}

function metadataValue(value: EditorialRecord['metadata'][string]): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value;
}

export function editorialEntryPresentation(
  item: EditorialRecord,
  destination: ListingDestination,
  context: EditorialEntryContext,
): EditorialEntryPresentation {
  const metadata = Object.entries(item.metadata)
    .filter((entry): boolean => {
      return Boolean(entry[1]) && visibleMetadata(item, entry[0]);
    })
    .map((entry): EditorialEntryPresentation['metadata'][number] => {
      return {
        key: entry[0],
        value: metadataValue(entry[1]),
      };
    });

  return {
    primary: entryAction(item.url, destination),
    secondary: entryAction(item.details_url, destination),
    icon: entryIcon(item),
    origin: editorialOrigin(item, context),
    metadata,
  };
}

export function editorialListPresentation(
  input: EditorialListInput,
): EditorialListPresentation {
  const kinds = editorialKinds[input.sectionID] ?? [
    ...new Set(
      input.items.map((item): string => {
        return item.type;
      }),
    ),
  ];

  const groups = kinds.map((type): EditorialGroup => {
    return {
      type,
      items: input.items.filter((item): boolean => {
        return item.type === type;
      }),
    };
  });

  return {
    groups: groups.filter((group): boolean => {
      return group.items.length > 0;
    }),
    missing: groups
      .filter((group): boolean => {
        return group.items.length === 0;
      })
      .map((group): string => {
        return group.type;
      }),
    fallback: entryAction(input.emptyAction?.href, input.destination),
  };
}
