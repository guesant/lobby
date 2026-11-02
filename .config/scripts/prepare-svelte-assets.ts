import { record } from '../../website/src/lib/features/content/validation.model.ts';
import { generated, imagesToGenerate, scenery, ui } from './raster.config.ts';
import { mkdir, readFile, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp, { type ResizeOptions } from 'sharp';

await rm(generated, {
  recursive: true,
  force: true,
});
await mkdir(generated, {
  recursive: true,
});

const railPath = resolve(ui, 'suspension-rail.png');

const rail = sharp(railPath);

const railMetadata = await rail.metadata();

const geometryPath = resolve(ui, 'suspension-rail.json');

const geometrySource = await readFile(geometryPath, 'utf8');

const rawGeometry: unknown = JSON.parse(geometrySource);

const geometryRecord = record(rawGeometry, 'rail geometry');

if (
  typeof geometryRecord['width'] !== 'number' ||
  !Number.isInteger(geometryRecord['width']) ||
  !railMetadata.width
) {
  throw new Error('Invalid rail width');
}

const geometry = {
  width: geometryRecord['width'],
  slices: record(geometryRecord['slices'], 'rail slices'),
};

const railLeft = Math.floor((railMetadata.width - geometry.width) / 2);

const slices: Record<string, string> = {};

for (const [
  name,
  rawSlice,
] of Object.entries(geometry.slices)) {
  const slice = record(rawSlice, `rail slice ${name}`);

  if (typeof slice['top'] !== 'number' || typeof slice['height'] !== 'number') {
    throw new Error(`Invalid rail slice ${name}`);
  }

  const path = resolve(generated, `rail-${name}.png`);

  const sliceOptions = {
    left: railLeft,
    top: slice['top'],
    width: geometry.width,
    height: slice['height'],
  };

  await sharp(railPath)
    .extract(sliceOptions)
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

  const pngInfo = await stat(pngPath);

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

  const webpInfo = await stat(webpPath);

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

  if (webpInfo.size >= pngInfo.size) {
    throw new Error(`Lossless WebP is not smaller: ${name}`);
  }
}

for (const [
  name,
  path,
  options,
] of imagesToGenerate) {
  const outputPath = resolve(generated, name);

  let image = sharp(path);

  if (options.extract) {
    image = image.extract(options.extract);
  }

  await image
    .resize(options.resize)
    .webp({
      quality: 82,
    })
    .toFile(outputPath);
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
] satisfies [
  string,
  string,
  ResizeOptions,
][]) {
  const outputPath = resolve(generated, name);

  await sharp(path)
    .resize(resize)
    .webp({
      quality: 78,
    })
    .toFile(outputPath);
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
] satisfies [
  string,
  string,
  ResizeOptions,
][]) {
  const outputPath = resolve(generated, name);

  await sharp(path)
    .resize(resize)
    .webp({
      quality: 48,
      effort: 4,
    })
    .toFile(outputPath);
}
