import type { EditorialEntry, SiteData } from './content.types.ts';
import { optionalProperty } from './object-fields.model.ts';
import {
  array,
  optionalBoolean,
  optionalString,
  record,
  requiredText,
  strings,
  type UnknownRecord,
  validateTextMap,
} from './validation.model.ts';

function validateEditorialLabels(
  value: unknown,
  label: string,
): EditorialEntry['labels'] {
  const source = record(value, label);

  const labels: EditorialEntry['labels'] = {};

  for (const [
    language,
    rawLabel,
  ] of Object.entries(source)) {
    const localized = record(rawLabel, `${label}.${language}`);

    const title = requiredText(
      localized['title'],
      `${label}.${language}.title`,
    );

    if (
      localized['description'] !== undefined &&
      typeof localized['description'] !== 'string'
    ) {
      throw new Error(`Invalid ${label}.${language}.description`);
    }

    labels[language] = {
      title,
      ...optionalProperty('description', localized['description']),
    };
  }

  return labels;
}

function validateEditorialFlags(item: UnknownRecord, label: string): void {
  for (const flag of [
    'enabled',
    'public',
    'private',
    'draft',
  ]) {
    if (item[flag] !== undefined && typeof item[flag] !== 'boolean') {
      throw new Error(`Invalid ${label}.${flag}`);
    }
  }
}

function validateEditorialOptions(item: UnknownRecord, label: string): void {
  validateEditorialFlags(item, label);

  for (const key of [
    'url',
    'group',
    'status',
    'updated',
  ] as const) {
    if (item[key] !== undefined && typeof item[key] !== 'string') {
      throw new Error(`Invalid ${label}.${key}`);
    }
  }

  if (
    typeof item['url'] === 'string' &&
    /^\s*(javascript|data|vbscript):/i.test(item['url'])
  ) {
    throw new Error(`Invalid ${label}.url`);
  }
}

function validateEditorialEntry(
  section: string,
  index: number,
  rawItem: unknown,
): EditorialEntry {
  const itemLabel = `editorial.entries.${section}[${String(index)}]`;

  const item = record(rawItem, itemLabel);

  const id = requiredText(item['id'], `${itemLabel}.id`);

  const labels = validateEditorialLabels(item['labels'], `${itemLabel}.labels`);

  validateEditorialOptions(item, itemLabel);

  const url = optionalString(item['url'], `${itemLabel}.url`);

  const group = optionalString(item['group'], `${itemLabel}.group`);

  const status = optionalString(item['status'], `${itemLabel}.status`);

  const updated = optionalString(item['updated'], `${itemLabel}.updated`);

  const enabled = optionalBoolean(item['enabled'], `${itemLabel}.enabled`);

  const isPublic = optionalBoolean(item['public'], `${itemLabel}.public`);

  const isPrivate = optionalBoolean(item['private'], `${itemLabel}.private`);

  const draft = optionalBoolean(item['draft'], `${itemLabel}.draft`);

  function resolveTags(): string[] | undefined {
    if (item['tags'] === undefined) {
      return undefined;
    }

    return strings(item['tags'], `${itemLabel}.tags`);
  }

  return {
    id,
    labels,
    ...optionalProperty('url', url),
    ...optionalProperty('tags', resolveTags()),
    ...optionalProperty('group', group),
    ...optionalProperty('status', status),
    ...optionalProperty('updated', updated),
    ...optionalProperty('enabled', enabled),
    ...optionalProperty('public', isPublic),
    ...optionalProperty('private', isPrivate),
    ...optionalProperty('draft', draft),
  };
}

export function validateEditorial(value: unknown): SiteData['editorial'] {
  const editorial = record(value, 'editorial data');

  const rawEntries = record(editorial['entries'], 'editorial.entries');

  const rawUI = record(editorial['ui'], 'editorial.ui');

  const rawNow = record(editorial['now'], 'editorial.now');

  const entries: Record<string, EditorialEntry[]> = {};

  const ui: Record<string, Record<string, string>> = {};

  const now: Record<string, Record<string, string>> = {};

  for (const [
    locale,
    rawUIEntry,
  ] of Object.entries(rawUI)) {
    ui[locale] = validateTextMap(rawUIEntry, `editorial.ui.${locale}`);
  }

  for (const [
    locale,
    rawNowEntry,
  ] of Object.entries(rawNow)) {
    now[locale] = validateTextMap(rawNowEntry, `editorial.now.${locale}`);
  }

  for (const [
    section,
    rawItems,
  ] of Object.entries(rawEntries)) {
    entries[section] = array(rawItems, `editorial.entries.${section}`)
      .map(
        (rawItem, index): EditorialEntry => {
          return validateEditorialEntry(section, index, rawItem);
        },
      );
  }

  return {
    entries,
    ui,
    now,
  };
}
