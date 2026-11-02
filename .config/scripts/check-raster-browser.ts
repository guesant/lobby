import {
  cursorCatalog,
  iconGeometry,
  iconManifest,
  railGeometry,
} from './asset-data.ts';
import { loadPNG, withRasterPage } from './raster-assets.ts';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import type { Page } from 'puppeteer-core';

void test('PNG atlas renders each icon without shifting or leaking adjacent tiles', async (): Promise<void> => {
  const manifest = await iconManifest();

  const geometry = await iconGeometry();

  const atlases = await Promise.all(
    [
      [
        'pixel',
        manifest.tileSize,
      ] as const,
      [
        'pixel-compact',
        manifest.compactTileSize,
      ] as const,
    ].map(
      async (
        entry,
      ): Promise<{
        name: string;
        tileSize: number;
        atlas: string;
      }> => {
        const [
          name,
          tileSize,
        ] = entry;

        return {
          name,
          tileSize,
          atlas: await loadPNG(
            `website/src/assets/icons/${name}.png`,
            manifest.count * tileSize,
            tileSize * 2,
          ),
        };
      },
    ),
  );

  const sources = await Promise.all(
    Object.keys(manifest.icons)
      .map(
        async (
          name,
        ): Promise<{
          name: string;
          png: string;
          mask: string;
        }> => {
          return {
            name,
            png: await loadPNG(
              `website/src/assets/icons/source/${name}.png`,
              manifest.tileSize,
              manifest.tileSize,
            ),
            mask: await loadPNG(
              `website/src/assets/icons/source/${name}-mask.png`,
              manifest.tileSize,
              manifest.tileSize,
            ),
          };
        },
      ),
  );

  async function verifyAtlasPixels(page: Page): Promise<void> {
    for (const {
      name,
      tileSize,
      atlas
    } of atlases) {
      for (const ratio of [
        1,
        2,
      ] as const) {
        for (const size of geometry.display_sizes) {
          const width = manifest.count * size;

          await page.setViewport({
            width,
            height: size * 4,
            deviceScaleFactor: ratio,
          });

          async function inspectNestedEntry12(input: {
            sources: {
              name: string;
              png: string;
              mask: string;
            }[];
            atlas: string;
            size: number;
            tileSize: number;
          }): Promise<void> {
            const {
              sources,
              atlas,
              size,
              tileSize
            } = input;

            document.body.replaceChildren();
            document.body.style.margin = '0';

            for (const source of sources) {
              await normalizeIconSources(source);
            }

            async function normalizeIconSources(source: {
              name: string;
              png: string;
              mask: string;
            }): Promise<void> {
              for (const key of [
                'png',
                'mask',
              ] as const) {
                const image = new Image();

                image.src = `data:image/png;base64,${source[key]}`;
                await image.decode();

                if (image.width === tileSize) {
                  continue;
                }

                const canvas = document.createElement('canvas');

                canvas.width = canvas.height = tileSize;

                const context = canvas.getContext('2d');

                if (context === null) {
                  throw new Error('Missing required context');
                }

                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                context.drawImage(image, 0, 0, tileSize, tileSize);
                source[key] = canvas
                  .toDataURL('image/png')
                  .slice('data:image/png;base64,'.length);
              }
            }

            function imageURL(png: string): string {
              return `url("data:image/png;base64,${png}")`;
            }

            for (const [
              column,
              source,
            ] of sources.entries()) {
              for (let row = 0; row < 4; row += 1) {
                const element = document.createElement('span');

                const isAtlas = row % 2 === 0;

                const isMask = row >= 2;

                function resolveBackgroundImage(): string {
                  if (isAtlas) {
                    return atlas;
                  }

                  if (isMask) {
                    return source.mask;
                  }

                  return source.png;
                }

                function resolveBackgroundSize(): string {
                  if (isAtlas) {
                    return `${String(sources.length * 100)}% 200%`;
                  }

                  return '100% 100%';
                }

                function resolveBackgroundPosition(): string {
                  if (isAtlas) {
                    if (isMask) {
                      return `${String((column / (sources.length - 1)) * 100)}% 100%`;
                    }

                    return `${String((column / (sources.length - 1)) * 100)}% 0%`;
                  }

                  return '0 0';
                }

                Object.assign(element.style, {
                  position: 'absolute',
                  left: `${String(column * size)}px`,
                  top: `${String(row * size)}px`,
                  width: `${String(size)}px`,
                  height: `${String(size)}px`,
                  backgroundImage: imageURL(resolveBackgroundImage()),
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: resolveBackgroundSize(),
                  backgroundPosition: resolveBackgroundPosition(),
                  imageRendering: 'auto',
                });
                document.body.append(element);
              }
            }

            await Promise.all(
              [
                atlas,
                ...sources.flatMap((input): string[] => {
                  const {
                    png,
                    mask
                  } = input;

                  return [
                    png,
                    mask,
                  ];
                }),
              ].map(async (png): Promise<void> => {
                const image = new Image();

                image.src = `data:image/png;base64,${png}`;
                await image.decode();
              }),
            );
            await new Promise((resolve): number => {
              return requestAnimationFrame((): number => {
                return requestAnimationFrame(resolve);
              });
            });
          }

          await page.evaluate(inspectNestedEntry12, {
            sources,
            atlas,
            size,
            tileSize,
          });

          const screenshot = await page.screenshot({
            omitBackground: true,
          });

          const difference = await page.evaluate(
            async (input): Promise<number> => {
              const {
                png,
                size,
                ratio
              } = input;

              const image = await window.rasterPixels(png);

              const pixels = image.data;

              const height = size * ratio;

              let changed = 0;

              for (const row of [
                0,
                2,
              ] as const) {
                for (let y = 0; y < height; y += 1) {
                  for (let x = 0; x < image.width; x += 1) {
                    compareAtlasPixel(row, y, x);
                  }
                }
              }

              return changed;

              function compareAtlasPixel(
                row: number,
                y: number,
                x: number,
              ): void {
                const first = ((row * height + y) * image.width + x) * 4;

                const second = first + height * image.width * 4;

                for (let channel = 0; channel < 4; channel += 1) {
                  const original = pixels[first + channel];

                  const mirrored = pixels[second + channel];

                  if (original === undefined || mirrored === undefined) {
                    throw new Error('Missing raster pixel channel');
                  }

                  if (Math.abs(original - mirrored) > 2) {
                    changed += 1;

                    return;
                  }
                }
              }
            },
            {
              png: Buffer.from(screenshot)
                .toString('base64'),
              size,
              ratio,
            },
          );

          assert.equal(
            difference,
            0,
            `${name} raster mismatch at ${String(size)}px and DPR ${String(ratio)}`,
          );
        }
      }
    }
  }

  await withRasterPage(verifyAtlasPixels);
});

void test('six PNG cursors preserve transparency and use one global cursor', async (): Promise<void> => {
  const config = await cursorCatalog();

  const names = [
    'click',
    'default',
    'grab',
    'pointer',
    'text',
    'wait',
  ];

  assert.deepEqual(
    config.assets
      .map((input): string => {
        const {
          id
        } = input;

        return id;
      })
      .sort(),
    names,
  );

  for (const directory of [
    'website/src/assets/cursors',
    'website/static/cursors',
  ] as const) {
    assert.deepEqual(
      (await readdir(directory)).sort(),
      names.map((id): string => {
        return `${id}.png`;
      }),
    );
  }

  async function verifyCursorPixels(page: Page): Promise<void> {
    for (const asset of config.assets) {
      const source = await readFile(asset.source);

      const width = source.readUInt32BE(16);

      const height = source.readUInt32BE(20);

      assert(width >= 512 && height >= 512, asset.source);
      await loadPNG(asset.source, width, height);

      const png = await loadPNG(
        asset.file,
        config.browser_size,
        config.browser_size,
      );

      const pixels = await page.evaluate(
        async (
          input,
        ): Promise<{
          visible: number;
          outside: number;
          hotspot: number;
        }> => {
          const {
            png,
            hotspot,
            padding
          } = input;

          const image = await window.rasterPixels(png);

          const data = image.data;

          let visible = 0;

          let outside = 0;

          function outsideBounds(x: number, y: number): boolean {
            return (
              x < padding ||
              y < padding ||
              x >= image.width - padding ||
              y >= image.height - padding
            );
          }

          function inspectCursorPixel(x: number, y: number): void {
            const opacity = data[(y * image.width + x) * 4 + 3];

            if (opacity === undefined) {
              throw new Error('Cursor pixel outside raster');
            }

            if (opacity <= 16) {
              return;
            }

            visible += 1;

            if (outsideBounds(x, y)) {
              outside += 1;
            }
          }

          for (let y = 0; y < image.height; y += 1) {
            for (let x = 0; x < image.width; x += 1) {
              inspectCursorPixel(x, y);
            }
          }

          const hotspotAlpha =
            data[(hotspot[1] * image.width + hotspot[0]) * 4 + 3];

          if (hotspotAlpha === undefined) {
            throw new Error('Cursor hotspot outside raster');
          }

          return {
            visible,
            outside,
            hotspot: hotspotAlpha,
          };
        },
        {
          png,
          hotspot: asset.hotspot,
          padding: config.padding,
        },
      );

      assert(
        pixels.visible > config.browser_size ** 2 * 0.08 &&
          pixels.visible < config.browser_size ** 2 * 0.8,
        asset.id,
      );
      assert.equal(pixels.outside, 0, asset.id);
      assert.equal(pixels.hotspot > 200, asset.id !== 'wait', asset.id);
    }
  }

  await withRasterPage(verifyCursorPixels);

  const css = await readFile('website/src/assets/css/main.css', 'utf8');

  const declarations = css.match(/\bcursor\s*:[^;]+;/g);

  if (declarations === null) {
    throw new Error('Missing required declarations');
  }

  assert.equal(declarations.length, 1);

  const active = config.assets.find((input): boolean => {
    const {
      id
    } = input;

    return id === 'default';
  });

  if (active === undefined) {
    throw new Error('Missing required active');
  }

  assert(
    declarations[0].includes(
      `url('/cursors/default.png') ${active.hotspot.join(' ')}`,
    ),
  );
  await assert.rejects(readFile('.config/scripts/generate-cursors.mjs'), {
    code: 'ENOENT',
  });
  assert.doesNotMatch(await readFile('justfile', 'utf8'), /^cursors:/m);
});

void test('rail slices join matching stems and preserve a complete terminal', async (): Promise<void> => {
  const geometry = await railGeometry();

  const source = await readFile(
    'website/src/assets/images/ui/suspension-rail.png',
  );

  const width = source.readUInt32BE(16);

  const height = source.readUInt32BE(20);

  assert(geometry.width <= width);

  for (const slice of Object.values(geometry.slices)) {
    assert(Number.isInteger(slice.top) && slice.top >= 0);
    assert(Number.isInteger(slice.height) && slice.height > 0);
    assert(slice.top + slice.height <= height);
  }

  const requiredValue = geometry.slices['terminal'];

  if (requiredValue === undefined) {
    throw new Error('Missing required requiredValue');
  }

  const requiredValueValue = geometry.slices['terminal'];

  if (requiredValueValue === undefined) {
    throw new Error('Missing required requiredValueValue');
  }

  assert.equal(requiredValue.top + requiredValueValue.height, height);

  async function verifyRailSlices(page: Page): Promise<void> {
    const edges = await page.evaluate(
      async (
        input,
      ): Promise<{
        first: number[];
        last: number[];
        terminal: number[];
        base: number[];
        coupling: number[];
      }> => {
        const {
          png,
          geometry
        } = input;

        const image = await window.rasterPixels(png);

        const pixels = image.data;

        const start = Math.floor((image.width - geometry.width) / 2);

        function stem(y: number): number[] {
          const columns = [];

          for (let x = start; x < start + geometry.width; x += 1) {
            const requiredValue = pixels[(y * image.width + x) * 4 + 3];

            if (requiredValue === undefined) {
              throw new Error('Missing required requiredValue');
            }

            if (requiredValue > 200) {
              columns.push(x);
            }
          }

          return columns;
        }

        const {
          chain,
          terminal,
          coupling
        } = geometry.slices;

        if (chain === undefined) {
          throw new Error('Missing required chain');
        }

        if (terminal === undefined) {
          throw new Error('Missing required terminal');
        }

        if (coupling === undefined) {
          throw new Error('Missing required coupling');
        }

        return {
          first: stem(chain.top),
          last: stem(chain.top + chain.height - 1),
          terminal: stem(terminal.top),
          base: stem(terminal.top + terminal.height - 1),
          coupling: stem(coupling.top + coupling.height - 1),
        };
      },
      {
        png: source.toString('base64'),
        geometry,
      },
    );

    assert(edges.first.length > 0);
    assert.deepEqual(edges.first, edges.last);
    assert.deepEqual(edges.first, edges.terminal);
    assert.deepEqual(edges.first, edges.coupling);
    assert.deepEqual(edges.base, []);
  }

  await withRasterPage(verifyRailSlices);
});
