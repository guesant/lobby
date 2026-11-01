import sharp, { type Region, type ResizeOptions } from 'sharp';
import { mkdir, readFile, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { record } from '../../website/src/lib/validation-primitives.ts';

const assets = resolve('website/src/assets');

const generated = resolve('website/src/static/assets/generated');

await rm(generated, {
  recursive: true,
  force: true,
});
await mkdir(generated, {
  recursive: true,
});

const images = resolve(assets, 'images');

const ui = resolve(images, 'ui');

const scenery = resolve(images, 'scenery');

const rail = sharp(resolve(ui, 'suspension-rail.png'));

const railMetadata = await rail.metadata();

const rawGeometry: unknown = JSON.parse(
  await readFile(resolve(ui, 'suspension-rail.json'), 'utf8'),
);

const geometryRecord = record(rawGeometry, 'rail geometry');

if (
  typeof geometryRecord.width !== 'number' ||
  !Number.isInteger(geometryRecord.width) ||
  !railMetadata.width
) {
  throw new Error('Invalid rail width');
}

const geometry = {
  width: geometryRecord.width,
  slices: record(geometryRecord.slices, 'rail slices'),
};

const railLeft = Math.floor((railMetadata.width - geometry.width) / 2);

const slices: Record<string, string> = {};

for (const [
  name,
  rawSlice,
] of Object.entries(geometry.slices)) {
  const slice = record(rawSlice, `rail slice ${name}`);

  if (typeof slice.top !== 'number' || typeof slice.height !== 'number') {
    throw new Error(`Invalid rail slice ${name}`);
  }

  const path = resolve(generated, `rail-${name}.png`);

  await sharp(resolve(ui, 'suspension-rail.png'))
    .extract({
      left: railLeft,
      top: slice.top,
      width: geometry.width,
      height: slice.height,
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toFile(path);
  slices[name] = `/assets/generated/rail-${name}.png`;
}

const losslessImages: Record<string, string> = {
  'rail-coupling': resolve(generated, 'rail-coupling.png'),
  'rail-lantern': resolve(generated, 'rail-lantern.png'),
  'section-toolbar-rail': resolve(ui, 'section-toolbar-rail.png'),
};

for (const [
  name,
  pngPath,
] of Object.entries(losslessImages)) {
  const webpPath = resolve(generated, `${name}.webp`);

  await sharp(pngPath)
    .webp({
      lossless: true,
      effort: 6,
    })
    .toFile(webpPath);

  const png = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  const webp = await sharp(webpPath)
    .ensureAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  for (let index = 0; index < png.data.length; index += 4) {
    if (png.data[index + 3] === 0 && webp.data[index + 3] === 0) {
      png.data.fill(0, index, index + 3);
      webp.data.fill(0, index, index + 3);
    }
  }

  if (
    png.info.width !== webp.info.width ||
    png.info.height !== webp.info.height ||
    !png.data.equals(webp.data)
  ) {
    throw new Error(`Lossless WebP changed pixels: ${name}`);
  }

  if ((await stat(webpPath)).size >= (await stat(pngPath)).size) {
    throw new Error(`Lossless WebP is not smaller: ${name}`);
  }
}

const imagesToGenerate: Array<
  [
    string,
    string,
    {
      extract?: Region;
      resize: ResizeOptions;
    },
  ]
> = [
  [
    'stone-frame.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 57,
        top: 57,
        width: 1140,
        height: 1140,
      },
      resize: {
        width: 384,
      },
    },
  ],
  [
    'oak-frame.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 57,
        top: 57,
        width: 1140,
        height: 1140,
      },
      resize: {
        width: 512,
      },
    },
  ],
  [
    'oak-drape-start.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 0,
        top: 0,
        width: 384,
        height: 448,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'oak-drape-end.webp',
    resolve(ui, 'oak-frame.png'),
    {
      extract: {
        left: 870,
        top: 57,
        width: 384,
        height: 448,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'stone-foot-start.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 0,
        top: 998,
        width: 384,
        height: 256,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'stone-foot-end.webp',
    resolve(ui, 'stone-frame.png'),
    {
      extract: {
        left: 870,
        top: 998,
        width: 384,
        height: 256,
      },
      resize: {
        width: 160,
      },
    },
  ],
  [
    'profile-lantern.webp',
    resolve(generated, 'rail-profile-lantern.png'),
    {
      resize: {
        width: 96,
      },
    },
  ],
  [
    'aged-oak.webp',
    resolve(ui, 'charcoal-planks.png'),
    {
      resize: {
        width: 160,
      },
    },
  ],
];

for (const [
  name,
  path,
  options,
] of imagesToGenerate) {
  let image = sharp(path);

  if (options.extract) {
    image = image.extract(options.extract);
  }

  await image
    .resize(options.resize)
    .webp({
      quality: 82,
    })
    .toFile(resolve(generated, name));
}

for (const [
  name,
  path,
  resize,
] of [
  [
    'night-desktop.webp',
    resolve(scenery, 'night-canyon.png'),
    {
      width: 1536,
    },
  ],
  [
    'night-mobile.webp',
    resolve(scenery, 'night-canyon.png'),
    {
      width: 384,
      height: 576,
      fit: 'cover',
    },
  ],
  [
    'day-desktop.webp',
    resolve(scenery, 'day.png'),
    {
      width: 1536,
    },
  ],
  [
    'day-mobile.webp',
    resolve(scenery, 'day.png'),
    {
      width: 384,
      height: 576,
      fit: 'cover',
    },
  ],
] satisfies Array<
  [
    string,
    string,
    ResizeOptions,
  ]
>) {
  await sharp(path)
    .resize(resize)
    .webp({
      quality: 78,
    })
    .toFile(resolve(generated, name));
}

for (const [
  name,
  path,
  resize,
] of [
  [
    'night-desktop-preview.webp',
    resolve(scenery, 'night-canyon.png'),
    {
      width: 384,
    },
  ],
  [
    'night-mobile-preview.webp',
    resolve(scenery, 'night-canyon.png'),
    {
      width: 96,
      height: 144,
      fit: 'cover',
    },
  ],
  [
    'day-desktop-preview.webp',
    resolve(scenery, 'day.png'),
    {
      width: 384,
    },
  ],
  [
    'day-mobile-preview.webp',
    resolve(scenery, 'day.png'),
    {
      width: 96,
      height: 144,
      fit: 'cover',
    },
  ],
] satisfies Array<
  [
    string,
    string,
    ResizeOptions,
  ]
>) {
  await sharp(path)
    .resize(resize)
    .webp({
      quality: 48,
      effort: 4,
    })
    .toFile(resolve(generated, name));
}
