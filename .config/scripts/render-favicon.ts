export async function renderFavicon(input: {
  favicon: string;
  size: number;
}): Promise<string> {
  const image = new Image();

  image.src = `data:image/png;base64,${input.favicon}`;
  await image.decode();

  const canvas = document.createElement('canvas');

  canvas.width = canvas.height = input.size;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Favicon generation requires a 2D context');
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, input.size, input.size);

  return canvas.toDataURL('image/png')
    .slice('data:image/png;base64,'.length);
}
