export function positionLanterns(
  body: HTMLElement,
  anchorBottoms: number[],
  gap: number,
): void {
  if (!body.getClientRects().length) {
    return;
  }

  const top = body.getBoundingClientRect().top;

  for (const lantern of body.querySelectorAll<HTMLElement>(
    '[data-rail-lantern]',
  )) {
    const index = Number(lantern.dataset['railLantern']);

    const anchorBottom = anchorBottoms[index];

    if (anchorBottom === undefined) {
      continue;
    }

    const position = anchorBottom + gap / 2 - top;

    const value = `${String(position)}px`;

    if (lantern.style.getPropertyValue('--rail-lantern-position') !== value) {
      lantern.style.setProperty('--rail-lantern-position', value);
    }

    if (
      index === Math.min(1, anchorBottoms.length - 1) &&
      body.style.getPropertyValue('--rail-splice-position') !== value
    ) {
      body.style.setProperty('--rail-splice-position', value);
    }
  }
}
