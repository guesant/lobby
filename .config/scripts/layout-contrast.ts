export async function measureMaterialContrast(): Promise<{
  panel: number;
  wood: number;
}> {
  const root = document.documentElement;

  function rgb(value: string): number[] {
    const result = value.match(/[\d.]+/g)
      ?.map(Number);

    if (!result || result.length < 3) {
      throw new Error(`Invalid material color: ${value}`);
    }

    return result;
  }

  function color(name: string): number[] {
    const sample = document.createElement('span');

    sample.style.color = `var(--${name})`;
    root.append(sample);

    const result = rgb(getComputedStyle(sample).color);

    sample.remove();

    return result;
  }

  async function texturePixels(): Promise<Uint8ClampedArray> {
    const imageURL = /url\(["']?(.*?)["']?\)/.exec(
      getComputedStyle(root)
        .getPropertyValue('--texture-aged-oak'),
    )?.[1];

    if (!imageURL) {
      throw new Error('Missing material texture URL');
    }

    const image = new Image();

    image.src = imageURL;
    await image.decode();

    const canvas = document.createElement('canvas');

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }

    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, canvas.width, canvas.height).data;
  }

  const pixels = await texturePixels();

  function luminance(rgb: number[]): number {
    return rgb
      .slice(0, 3)
      .map((value): number => {
        value /= 255;

        if (value <= 0.04045) {
          return value / 12.92;
        }

        return ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index: number): number => {
        const requiredValue = [
          0.2126,
          0.7152,
          0.0722,
        ][index];

        if (requiredValue === undefined) {
          throw new Error('Missing required requiredValue');
        }

        return sum + value * requiredValue;
      }, 0);
  }

  function blend(under: number[], over: number[]): number[] {
    return under.map((value, index: number): number => {
      const component = over[index];

      if (component === undefined) {
        throw new Error('Missing material color component');
      }

      return value * (1 - (over[3] ?? 1)) + component * (over[3] ?? 1);
    });
  }

  function ratio(one: number[], two: number[]): number {
    const a = luminance(one),
      b = luminance(two);

    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  const panelWash = color('color-panel-wash');

  const woodWash = color('color-wood-wash');

  const warmth = color('color-frame-warmth');

  const panelText = [
    'color-text',
    'color-text-muted',
    'color-accent-strong',
  ].map(color);

  const woodText = [
    'color-wood-text',
    'color-wood-muted',
  ].map(color);

  const activeNavigation = document.querySelector(
    '.header-navigation-links a[aria-current="page"]',
  );

  if (!activeNavigation) {
    throw new Error('Missing current header navigation link');
  }

  woodText.push(rgb(getComputedStyle(activeNavigation).color));

  let panel = Infinity,
    wood = Infinity;

  for (let index = 0; index < pixels.length; index += 4) {
    const pixel = [
      ...pixels.slice(index, index + 3),
    ];

    if (pixels[index + 3] !== 255) {
      throw new Error('Material must be opaque');
    }

    const panelPixel = blend(pixel, panelWash);

    const woodPixel = blend(blend(blend(pixel, woodWash), warmth), warmth);

    for (const foreground of panelText) {
      panel = Math.min(panel, ratio(foreground, panelPixel));
    }

    for (const foreground of woodText) {
      wood = Math.min(wood, ratio(foreground, woodPixel));
    }
  }

  return {
    panel,
    wood,
  };
}
