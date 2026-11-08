import type { renderAtlas } from '../icon-renderer.ts';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

export async function writeAtlas(
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
      const image = Buffer.from(png, 'base64');

      if (name === 'pixel-compact') {
        const path = `${staging}/${name}.webp`;

        await sharp(image)
          .webp({
            lossless: true,
            effort: 6,
          })
          .toFile(path);
        await rename(path, `website/src/assets/icons/${name}.webp`);

        continue;
      }

      const path = `${staging}/${name}.png`;

      await writeFile(path, image);
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
