import {
  iconManifest,
  iconGeometry,
  cursorCatalog,
  railGeometry,
} from './asset-data.ts';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { loadPNG, withRasterPage } from './raster-assets.ts';

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
      async ([
        name,
        tileSize,
      ]): Promise<{
        name: string;
        tileSize: number;
        atlas: string;
      }> => {
        return {
          name,
          tileSize,
          atlas: await loadPNG(
            `website/src/assets/icons/${name}.png`,
            manifest.count * tileSize!,
            tileSize! * 2,
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

  await withRasterPage(async (page): Promise<void> => {
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
          await page.evaluate(
            async ({
              sources,
              atlas,
              size,
              tileSize
            }): Promise<void> => {
              document.body.replaceChildren();
              document.body.style.margin = '0';

              for (const source of sources) {
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

                  const context = canvas.getContext('2d')!;

                  context.imageSmoothingEnabled = true;
                  context.imageSmoothingQuality = 'high';
                  context.drawImage(image, 0, 0, tileSize!, tileSize);
                  source[key] = canvas
                    .toDataURL('image/png')
                    .slice('data:image/png;base64,'.length);
                }
              }

              const imageURL = (png: string): string => {
                return `url("data:image/png;base64,${png}")`;
              };

              for (const [
                column,
                source,
              ] of sources.entries()) {
                for (let row = 0; row < 4; row += 1) {
                  const element = document.createElement('span');

                  const isAtlas = row % 2 === 0;

                  const isMask = row >= 2;

                  const resolveBackgroundImage = (): string => {
                    if (isAtlas) {
                      return atlas;
                    }

                    if (isMask) {
                      return source.mask;
                    }

                    return source.png;
                  };

                  const resolveBackgroundSize = (): string => {
                    if (isAtlas) {
                      return `${sources.length * 100}% 200%`;
                    }

                    return '100% 100%';
                  };

                  const resolveBackgroundPosition = (): string => {
                    if (isAtlas) {
                      if (isMask) {
                        return `${(column / (sources.length - 1)) * 100}% 100%`;
                      }

                      return `${(column / (sources.length - 1)) * 100}% 0%`;
                    }

                    return '0 0';
                  };

                  Object.assign(element.style, {
                    position: 'absolute',
                    left: `${column * size}px`,
                    top: `${row * size}px`,
                    width: `${size}px`,
                    height: `${size}px`,
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
                  ...sources.flatMap(({
                    png,
                    mask
                  }): string[] => {
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
            },
            {
              sources,
              atlas,
              size,
              tileSize,
            },
          );

          const screenshot = await page.screenshot({
            omitBackground: true,
          });

          const difference = await page.evaluate(
            async ({
              png,
              size,
              ratio
            }): Promise<number> => {
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
                    const first = ((row * height + y) * image.width + x) * 4;

                    const second = first + height * image.width * 4;

                    if (
                      [
                        0,
                        1,
                        2,
                        3,
                      ].some((channel): boolean => {
                        return (
                          Math.abs(
                            pixels[first + channel]! -
                              pixels[second + channel]!,
                          ) > 2
                        );
                      })
                    ) {
                      changed += 1;
                    }
                  }
                }
              }

              return changed;
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
            `${name} raster mismatch at ${size}px and DPR ${ratio}`,
          );
        }
      }
    }
  });
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
      .map(({
        id
      }): string => {
        return id;
      })
      .sort(),
    names,
  );

  for (const directory of [
    'website/src/assets/cursors',
    'website/src/static/cursors',
  ] as const) {
    assert.deepEqual(
      (await readdir(directory)).sort(),
      names.map((id): string => {
        return `${id}.png`;
      }),
    );
  }

  await withRasterPage(async (page): Promise<void> => {
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
        async ({
          png,
          hotspot,
          padding,
        }): Promise<{
          visible: number;
          outside: number;
          hotspot: number;
        }> => {
          const image = await window.rasterPixels(png);

          const data = image.data;

          let visible = 0;

          let outside = 0;

          for (let y = 0; y < image.height; y += 1) {
            for (let x = 0; x < image.width; x += 1) {
              if (data[(y * image.width + x) * 4 + 3]! <= 16) {
                continue;
              }

              visible += 1;

              if (
                x < padding ||
                y < padding ||
                x >= image.width - padding ||
                y >= image.height - padding
              ) {
                outside += 1;
              }
            }
          }

          const hotspotAlpha =
            data[(hotspot[1]! * image.width + hotspot[0]) * 4 + 3];

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
      assert.equal(pixels!.hotspot > 200, asset.id !== 'wait', asset.id);
    }
  });

  const css = await readFile('website/src/assets/css/main.css', 'utf8');

  const declarations = css.match(/\bcursor\s*:[^;]+;/g);

  assert.equal(declarations!.length, 1);

  const active = config.assets.find(({
    id
  }): boolean => {
    return id === 'default';
  });

  assert(
    declarations![0].includes(
      `url('/cursors/default.png') ${active!.hotspot.join(' ')}`,
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

  assert.equal(
    geometry!.slices.terminal!.top + geometry!.slices.terminal!.height,
    height,
  );
  await withRasterPage(async (page): Promise<void> => {
    const edges = await page.evaluate(
      async ({
        png,
        geometry,
      }): Promise<{
        first: number[];
        last: number[];
        terminal: number[];
        base: number[];
        coupling: number[];
      }> => {
        const image = await window.rasterPixels(png);

        const pixels = image.data;

        const start = Math.floor((image.width - geometry.width) / 2);

        const stem = (y: number): number[] => {
          const columns = [];

          for (let x = start; x < start + geometry.width; x += 1) {
            if (pixels[(y * image.width + x) * 4 + 3]! > 200) {
              columns.push(x);
            }
          }

          return columns;
        };

        const {
          chain,
          terminal,
          coupling
        } = geometry.slices;

        return {
          first: stem(chain!.top),
          last: stem(chain!.top + chain!.height - 1),
          terminal: stem(terminal!.top),
          base: stem(terminal!.top + terminal!.height - 1),
          coupling: stem(coupling!.top + coupling!.height - 1),
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
  });
});
