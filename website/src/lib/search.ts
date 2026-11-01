export type SearchItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  group: string;
  source: string;
  language: string;
  type: string;
  tags: string[];
  metadata?: Record<string, string | number | boolean | string[]>;
  details_url?: string;
  details_label?: string;
};

export function searchItems<
  T extends Pick<SearchItem, 'title' | 'summary' | 'tags' | 'metadata'>,
>(index: T[], query: string): T[] {
  const normalize = (value: string): string => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  };

  const terms = normalize(query.trim())
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) {
    return [];
  }

  return index.filter((item): boolean => {
    const haystack = normalize(
      [
        item.title,
        item.summary,
        ...(item.tags || []),
        ...Object.values(item.metadata || {})
          .map(String),
      ].join(' '),
    );

    return terms.every((term: string): boolean => {
      return haystack.includes(term);
    });
  });
}

function stringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown): boolean => {
      return typeof entry === 'string';
    })
  );
}

function metadataValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return (
    typeof value === 'string' || typeof value === 'boolean' || stringList(value)
  );
}

function validMetadata(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value)
    .every(metadataValue);
}

function safeSearchURL(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value, 'https://guesant.net');

    return [
      'https:',
      'http:',
      'mailto:',
      'tel:',
    ].includes(url.protocol);
  } catch {
    return false;
  }
}

function validDetails(item: Record<string, unknown>): boolean {
  if (item.details_url !== undefined && typeof item.details_url !== 'string') {
    return false;
  }

  if (
    item.details_label !== undefined &&
    typeof item.details_label !== 'string'
  ) {
    return false;
  }

  if (!item.details_url) {
    return true;
  }

  return Boolean(item.details_label) && safeSearchURL(item.details_url);
}

export function isSearchItem(value: unknown): value is SearchItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  const fields = [
    'id',
    'title',
    'summary',
    'url',
    'group',
    'source',
    'language',
    'type',
  ];

  const required = fields.every((key): boolean => {
    return typeof item[key] === 'string';
  });

  return (
    required &&
    stringList(item.tags) &&
    safeSearchURL(item.url) &&
    validDetails(item) &&
    validMetadata(item.metadata)
  );
}

export type SearchFilters = {
  source: string;
  type: string;
  language: string;
};

export function nextSearchResult(
  current: number,
  key: 'ArrowDown' | 'ArrowUp',
  count: number,
): number {
  if (count <= 0) {
    return -1;
  }

  if (current < 0) {
    if (key === 'ArrowUp') {
      return count - 1;
    }

    return 0;
  }

  if (key === 'ArrowUp') {
    return (current + count - 1) % count;
  }

  return (current + 1) % count;
}

export function filterSearchItems(
  items: SearchItem[],
  filters: SearchFilters,
): SearchItem[] {
  return items.filter((item): boolean => {
    return (
      (!filters.source || item.source === filters.source) &&
      (!filters.type || item.type === filters.type) &&
      (!filters.language || item.language === filters.language)
    );
  });
}
