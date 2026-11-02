import { iconCatalog, iconGeometry } from './asset-data.ts';
import { renderAtlas, renderFavicon } from './icon-renderer.ts';
import { loadPNG, withRasterPage } from './raster-assets.ts';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const catalog = await iconCatalog();

const names = Object.keys(catalog);

const {
  tile_size: tileSize,
  compact_tile_size: compactTileSize
} =
  await iconGeometry();

const tiles = await Promise.all(
  names.flatMap(
    (
      name,
      column,
    ): Promise<{
      png: string;
      column: number;
      row: number;
    }>[] => {
      return [
        '',
        '-mask',
      ].map(
        async (
          suffix,
          row,
        ): Promise<{
          png: string;
          column: number;
          row: number;
        }> => {
          return {
            png: await loadPNG(
              `website/src/assets/icons/source/${name}${suffix}.png`,
              tileSize,
              tileSize,
            ),
            column,
            row,
          };
        },
      );
    },
  ),
);

const favicon = await loadPNG('website/src/assets/icons/favicon.png', 64, 64);

function opaqueSize(data: Uint8Array, width: number, height: number): number {
  const bounds = {
    left: width,
    top: height,
    right: -1,
    bottom: -1,
  };

  for (let offset = 3; offset < data.length; offset += 4) {
    const requiredValue = data[offset];

    if (requiredValue === undefined) {
      throw new Error('Missing required requiredValue');
    }

    if (requiredValue <= 16) {
      continue;
    }

    const pixel = (offset - 3) / 4;

    const x = pixel % width;

    const y = Math.floor(pixel / width);

    bounds.left = Math.min(bounds.left, x);
    bounds.top = Math.min(bounds.top, y);
    bounds.right = Math.max(bounds.right, x);
    bounds.bottom = Math.max(bounds.bottom, y);
  }

  return Math.max(
    bounds.right - bounds.left + 1,
    bounds.bottom - bounds.top + 1,
  );
}

const opticalScales = Object.fromEntries(
  await Promise.all(
    names.map(
      async (
        name,
      ): Promise<
        [
          string,
          number,
        ]
      > => {
        const {
          data,
          info
        } = await sharp(
          `website/src/assets/icons/source/${name}.png`,
        )
          .ensureAlpha()
          .raw()
          .toBuffer({
            resolveWithObject: true,
          });

        const size = opaqueSize(data, info.width, info.height);

        if (size <= 0) {
          throw new Error(`Empty icon source: ${name}`);
        }

        return [
          name,
          Number(((tileSize * 5) / 6 / size).toFixed(3)),
        ];
      },
    ),
  ),
);

async function writeAtlas(
  atlas: Awaited<ReturnType<typeof renderAtlas>>,
): Promise<void> {
  await mkdir('.cache/icons', {
    recursive: true,
  });

  const staging = await mkdtemp('.cache/icons/atlas-');

  try {
    for (const [
      name,
      png,
    ] of Object.entries(atlas)) {
      const path = `${staging}/${name}.png`;

      await writeFile(path, Buffer.from(png, 'base64'));
      execFileSync('optipng', [
        '-quiet',
        '-o3',
        '-strip',
        'all',
        path,
      ]);
      await rename(path, `website/src/assets/icons/${name}.png`);
    }
  } finally {
    await rm(staging, {
      recursive: true,
      force: true,
    });
  }
}

await withRasterPage(async (page): Promise<void> => {
  const atlas = await page.evaluate(renderAtlas, {
    tiles,
    columns: names.length,
    tileSize,
    compactTileSize,
  });

  await writeAtlas(atlas);

  for (const [
    name,
    size,
  ] of [
      [
        'favicon',
        64,
      ],
      [
        'icon-192',
        192,
      ],
      [
        'icon-512',
        512,
      ],
    ] as const) {
    const png = await page.evaluate(renderFavicon, {
      favicon,
      size,
    });

    await writeFile(`website/static/${name}.png`, Buffer.from(png, 'base64'));
  }
});

const manifest = {
  count: names.length,
  tileSize,
  compactTileSize,
  icons: Object.fromEntries(
    names.map(
      (
        name,
        column,
      ): [
        string,
        {
          colored: boolean;
          position: number;
          opticalScale: number;
        },
      ] => {
        const colored = catalog[name];

        const opticalScale = opticalScales[name];

        if (colored === undefined || opticalScale === undefined) {
          throw new Error(`Missing icon metadata: ${name}`);
        }

        return [
          name,
          {
            colored,
            position: (column / (names.length - 1)) * 100,
            opticalScale,
          },
        ];
      },
    ),
  ),
};

await writeFile(
  'website/src/assets/icons/manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  `Generated PNG atlas with ${String(names.length)} icons and PNG favicons`,
);
