function positionLanterns(
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

    const value = `${String(anchor.getBoundingClientRect().bottom + gap / 2 - top)}px`;

    lantern.style.setProperty('--rail-lantern-position', value);

    if (index === Math.min(1, anchors.length - 1)) {
      body.style.setProperty('--rail-splice-position', value);
    }
  }
}

class RailLayout {
  #controller = new AbortController();

  #content: HTMLElement;

  #observer: ResizeObserver;

  #frame: number | null = null;

  constructor(content: HTMLElement) {
    this.#content = content;

    const schedule = this.schedule.bind(this);

    this.#observer = new ResizeObserver(schedule);

    for (const element of [
      content,
      ...content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
    ]) {
      this.#observer.observe(element);
    }

    window.addEventListener('resize', schedule, {
      signal: this.#controller.signal,
    });
    void document.fonts.ready.then(schedule, schedule);
    this.schedule();
  }

  #position(): void {
    this.#frame = null;

    const anchors = [
      ...this.#content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
    ];

    if (!anchors.length) {
      return;
    }

    const gap = parseFloat(getComputedStyle(this.#content).rowGap);

    for (const body of this.#content.querySelectorAll<HTMLElement>(
      '.suspension-body',
    )) {
      positionLanterns(body, anchors, gap);
    }
  }

  schedule(): void {
    if (this.#controller.signal.aborted || this.#frame !== null) {
      return;
    }

    this.#frame = requestAnimationFrame((): void => {
      this.#position();
    });
  }

  destroy(): void {
    this.#controller.abort();
    this.#observer.disconnect();

    if (this.#frame !== null) {
      cancelAnimationFrame(this.#frame);
    }
  }
}

export function suspensionRails(content: HTMLElement): () => void {
  const layout = new RailLayout(content);

  return layout.destroy.bind(layout);
}
