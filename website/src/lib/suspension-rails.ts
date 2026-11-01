export function suspensionRails(content: HTMLElement): () => void {
  const controller = new AbortController();

  let active = true;

  let observer: ResizeObserver | undefined;

  let frame: number | null = null;

  const position = (): void => {
    frame = null;

    const anchors = [
      ...content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
    ];

    if (!content || !anchors.length) {
      return;
    }

    const gap = parseFloat(getComputedStyle(content).rowGap);

    for (const body of content.querySelectorAll<HTMLElement>(
      '.suspension-body',
    )) {
      if (!body.getClientRects().length) {
        continue;
      }

      const top = body.getBoundingClientRect().top;

      for (const lantern of body.querySelectorAll<HTMLElement>(
        '[data-rail-lantern]',
      )) {
        const anchor = anchors[Number(lantern.dataset.railLantern)];

        if (!anchor) {
          continue;
        }

        const value = `${
          anchor.getBoundingClientRect().bottom + gap / 2 - top
        }px`;

        lantern.style.setProperty('--rail-lantern-position', value);

        if (
          Number(lantern.dataset.railLantern) ===
          Math.min(1, anchors.length - 1)
        ) {
          body.style.setProperty('--rail-splice-position', value);
        }
      }
    }
  };

  const schedule = (): void => {
    if (!active) {
      return;
    }

    if (frame === null) {
      frame = requestAnimationFrame(position);
    }
  };

  const observePage = (): void => {
    observer?.disconnect();
    observer = new ResizeObserver(schedule);

    const anchors = [
      ...content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
    ];

    for (const element of [
      content,
      ...anchors,
    ]) {
      if (element) {
        observer.observe(element);
      }
    }

    document.fonts.ready.then(schedule)
      .catch((): void => {});
    schedule();
  };

  window.addEventListener('resize', schedule, {
    signal: controller.signal,
  });
  observePage();

  return (): void => {
    active = false;
    controller.abort();
    observer?.disconnect();

    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
  };
}
