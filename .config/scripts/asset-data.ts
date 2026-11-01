import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import {
  array,
  record,
  requiredText,
} from '../../website/src/lib/validation-primitives.ts';

export type IconManifest = {
  count: number;
  tileSize: number;
  compactTileSize: number;
  icons: Record<
    string,
    {
      colored: boolean;
      position: number;
      opticalScale: number;
    }
  >;
};

export type IconGeometry = {
  tile_size: number;
  compact_tile_size: number;
  interface_grid: number;
  display_sizes: number[];
  icons: Record<string, unknown>;
};

export type CursorCatalog = {
  browser_size: number;
  padding: number;
  assets: Array<{
    id: string;
    source: string;
    file: string;
    hotspot: [
      number,
      number,
    ];
  }>;
};

export type RailGeometry = {
  width: number;
  slices: Record<
    string,
    {
      top: number;
      height: number;
    }
  >;
};

export function required<T>(
  value: T | null | undefined,
  label: string = 'value',
): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${label}`);
  }

  return value;
}

function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid asset number');
  }

  return value;
}

export async function iconCatalog(): Promise<Record<string, boolean>> {
  const value: unknown = JSON.parse(
    await readFile('.config/icon-catalog.json', 'utf8'),
  );

  const output: Record<string, boolean> = {};

  for (const [
    key,
    colored,
  ] of Object.entries(record(value, 'icon catalog'))) {
    if (typeof colored !== 'boolean') {
      throw new Error('Invalid icon color flag');
    }

    output[key] = colored;
  }

  return output;
}

export async function iconManifest(): Promise<IconManifest> {
  const value: unknown = JSON.parse(
    await readFile('website/src/assets/icons/manifest.json', 'utf8'),
  );

  const source = record(value, 'icon manifest');

  const icons: IconManifest['icons'] = {};

  for (const [
    key,
    value,
  ] of Object.entries(record(source.icons, 'icon manifest entries'))) {
    const entry = record(value, `icon ${key}`);

    if (typeof entry.colored !== 'boolean') {
      throw new Error('Invalid icon color flag');
    }

    icons[key] = {
      colored: entry.colored,
      position: number(entry.position),
      opticalScale: number(entry.opticalScale),
    };
  }

  return {
    count: number(source.count),
    tileSize: number(source.tileSize),
    compactTileSize: number(source.compactTileSize),
    icons,
  };
}

export async function iconGeometry(): Promise<IconGeometry> {
  const source = record(
    parse(await readFile('.config/icon-assets.yaml', 'utf8')) as unknown,
    'icon geometry',
  );

  return {
    tile_size: number(source.tile_size),
    compact_tile_size: number(source.compact_tile_size),
    interface_grid: number(source.interface_grid),
    display_sizes: array(source.display_sizes, 'display sizes')
      .map(number),
    icons: record(source.icons, 'icon geometry entries'),
  };
}

export async function cursorCatalog(): Promise<CursorCatalog> {
  const source = record(
    parse(await readFile('.config/cursor-assets.yaml', 'utf8')) as unknown,
    'cursor catalog',
  );

  const assets = array(source.assets, 'cursor assets')
    .map(
      (value): CursorCatalog['assets'][number] => {
        const entry = record(value, 'cursor entry');

        const coordinates = array(entry.hotspot, 'cursor hotspot');

        if (coordinates.length !== 2) {
          throw new Error('Invalid cursor hotspot');
        }

        return {
          id: requiredText(entry.id, 'cursor id'),
          source: requiredText(entry.source, 'cursor source'),
          file: requiredText(entry.file, 'cursor file'),
          hotspot: [
            number(coordinates[0]),
            number(coordinates[1]),
          ],
        };
      },
    );

  return {
    browser_size: number(source.browser_size),
    padding: number(source.padding),
    assets,
  };
}

export async function railGeometry(): Promise<RailGeometry> {
  const value: unknown = JSON.parse(
    await readFile('website/src/assets/images/ui/suspension-rail.json', 'utf8'),
  );

  const source = record(value, 'rail geometry');

  const slices: RailGeometry['slices'] = {};

  for (const [
    key,
    value,
  ] of Object.entries(record(source.slices, 'rail slices'))) {
    const slice = record(value, `rail ${key}`);

    slices[key] = {
      top: number(slice.top),
      height: number(slice.height),
    };
  }

  return {
    width: number(source.width),
    slices,
  };
}
