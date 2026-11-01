import { iconCatalog, iconGeometry } from './asset-data.ts';
import sharp from 'sharp';
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { withRasterPage, loadPNG } from './raster-assets.ts';

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

        const bounds = {
          left: info.width,
          top: info.height,
          right: -1,
          bottom: -1,
        };

        for (let offset = 3; offset < data.length; offset += 4) {
          if (data[offset]! <= 16) {
            continue;
          }

          const pixel = (offset - 3) / 4;

          const x = pixel % info.width;

          const y = Math.floor(pixel / info.width);

          bounds.left = Math.min(bounds.left, x);
          bounds.top = Math.min(bounds.top, y);
          bounds.right = Math.max(bounds.right, x);
          bounds.bottom = Math.max(bounds.bottom, y);
        }

        const size = Math.max(
          bounds.right - bounds.left + 1,
          bounds.bottom - bounds.top + 1,
        );

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

await withRasterPage(async (page): Promise<void> => {
  const atlas = await page.evaluate(
    async ({
      tiles,
      columns,
      tileSize,
      compactTileSize,
    }): Promise<{
      pixel: string;
      'pixel-compact': string;
    }> => {
      const canvas = document.createElement('canvas');

      canvas.width = columns * tileSize;
      canvas.height = tileSize * 2;

      const context = canvas.getContext('2d')!;

      context.imageSmoothingEnabled = false;

      const compact = document.createElement('canvas');

      compact.width = columns * compactTileSize;
      compact.height = compactTileSize * 2;

      const compactContext = compact.getContext('2d')!;

      compactContext.imageSmoothingEnabled = true;
      compactContext.imageSmoothingQuality = 'high';

      for (const tile of tiles) {
        const image = new Image();

        image.src = `data:image/png;base64,${tile.png}`;
        await image.decode();
        context.drawImage(image, tile.column * tileSize, tile.row * tileSize);
        compactContext.drawImage(
          image,
          tile.column * compactTileSize,
          tile.row * compactTileSize,
          compactTileSize,
          compactTileSize,
        );
      }

      return {
        pixel: canvas
          .toDataURL('image/png')
          .slice('data:image/png;base64,'.length),
        'pixel-compact': compact
          .toDataURL('image/png')
          .slice('data:image/png;base64,'.length),
      };
    },
    {
      tiles,
      columns: names.length,
      tileSize,
      compactTileSize,
    },
  );

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
    const png = await page.evaluate(
      async ({
        favicon,
        size
      }): Promise<string> => {
        const image = new Image();

        image.src = `data:image/png;base64,${favicon}`;
        await image.decode();

        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = size;

        const context = canvas.getContext('2d')!;

        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, size, size);

        return canvas
          .toDataURL('image/png')
          .slice('data:image/png;base64,'.length);
      },
      {
        favicon,
        size,
      },
    );

    await writeFile(
      `website/src/static/${name}.png`,
      Buffer.from(png, 'base64'),
    );
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
console.log(`Generated PNG atlas with ${names.length} icons and PNG favicons`);
