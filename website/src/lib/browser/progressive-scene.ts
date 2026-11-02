import { on } from 'svelte/events';

type Landscape = {
  element: HTMLElement;
  preview: string;
  final: string;
};

function backgroundURL(background: string): string {
  return /^url\(["']?(.*?)["']?\)$/.exec(background)?.[1] ?? '';
}

class DecodedImages {
  #pending = new Map<string, Promise<void>>();

  async load(source: string, priority?: 'high' | 'low'): Promise<void> {
    const pending = this.#pending.get(source);

    if (pending) {
      return pending;
    }

    const image = new Image();

    if (priority) {
      image.fetchPriority = priority;
    }

    image.src = source;

    const loading = image.decode();

    this.#pending.set(source, loading);

    try {
      await loading;
    } catch (error) {
      this.#pending.delete(source);

      throw error;
    }
  }
}

class LandscapeLoader {
  #root = document.documentElement;

  #scene: HTMLElement;

  #request = 0;

  #prepared: Landscape | undefined;

  #decoded = new DecodedImages();

  #observer: MutationObserver;

  #cleanup: (() => void)[];

  constructor(scene: HTMLElement) {
    this.#scene = scene;

    const schedule = this.schedule.bind(this);

    this.#observer = new MutationObserver(schedule);
    this.#observer.observe(this.#root, {
      attributes: true,
      attributeFilter: [
        'data-theme',
      ],
    });
    this.#cleanup = [
      on(matchMedia('(prefers-color-scheme: light)'), 'change', schedule),
      on(window, 'resize', schedule, {
        passive: true,
      }),
    ];
    this.schedule();
  }

  #sources(): Landscape | undefined {
    const element = this.#scene.querySelector<HTMLElement>('.world-landscape');

    const previewElement = this.#scene.querySelector(
      '.world-landscape-preview',
    );

    if (
      !element ||
      !previewElement ||
      !this.#root.hasAttribute('data-js-enabled')
    ) {
      return undefined;
    }

    const styles = getComputedStyle(this.#root);

    const preview = backgroundURL(
      styles.getPropertyValue('--landscape-preview'),
    );

    const final = backgroundURL(styles.getPropertyValue('--landscape-image'));

    if (!preview || !final) {
      return undefined;
    }

    return {
      element,
      preview,
      final,
    };
  }

  #unchanged(sources: Landscape): boolean {
    return (
      this.#prepared?.element === sources.element &&
      this.#prepared.preview === sources.preview &&
      this.#prepared.final === sources.final
    );
  }

  #current(sources: Landscape, request: number): boolean {
    if (request !== this.#request) {
      return false;
    }

    const current = this.#sources();

    return (
      current?.final === sources.final && current.preview === sources.preview
    );
  }

  async #preview(sources: Landscape, request: number): Promise<boolean> {
    try {
      await this.#decoded.load(sources.preview);

      return request === this.#request;
    } catch {
      if (request === this.#request) {
        sources.element.style.backgroundImage = `url("${sources.final}")`;
        this.#root.dataset['landscapePreviewFailed'] = 'true';
      }

      return false;
    }
  }

  #begin(sources: Landscape): number {
    this.#prepared = sources;
    this.#root.removeAttribute('data-landscape-ready');
    this.#root.removeAttribute('data-landscape-preview-failed');
    sources.element.style.backgroundImage = 'none';

    return ++this.#request;
  }

  async #prepare(): Promise<void> {
    const sources = this.#sources();

    if (!sources || this.#unchanged(sources)) {
      return;
    }

    const request = this.#begin(sources);

    if (!(await this.#preview(sources, request))) {
      return;
    }

    try {
      await this.#decoded.load(sources.final, 'low');
    } catch {
      if (request === this.#request) {
        this.#prepared = undefined;
      }

      return;
    }

    if (this.#current(sources, request)) {
      sources.element.style.backgroundImage = `url("${sources.final}")`;
      this.#root.dataset['landscapeReady'] = 'true';
    }
  }

  schedule(): void {
    void this.#prepare();
  }

  destroy(): void {
    this.#request += 1;
    this.#observer.disconnect();

    for (const dispose of this.#cleanup) {
      dispose();
    }
  }
}

export function progressiveScene(scene: HTMLElement): () => void {
  const loader = new LandscapeLoader(scene);

  return loader.destroy.bind(loader);
}
