export function positionLanterns(
  body: HTMLElement,
  anchors: HTMLElement[],
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

    const anchor = anchors[index];

    if (!anchor) {
      continue;
    }

    const anchorBottom = anchor.getBoundingClientRect().bottom;

    const position = anchorBottom + gap / 2 - top;

    const value = `${String(position)}px`;

    lantern.style.setProperty('--rail-lantern-position', value);

    if (index === Math.min(1, anchors.length - 1)) {
      body.style.setProperty('--rail-splice-position', value);
    }
  }
}
