import { on } from 'svelte/events';

export function progressiveScene(scene: HTMLElement): () => void {
  const root = document.documentElement;

  let landscapeRequest = 0;

  let prepared:
    | {
      element: HTMLElement;
      preview: string;
      final: string;
    }
    | undefined;

  const decoded = new Map<string, Promise<void>>();

  const unchangedLandscape = (
    element: HTMLElement,
    preview: string,
    final: string,
  ): boolean => {
    return (
      prepared?.element === element &&
      prepared.preview === preview &&
      prepared.final === final
    );
  };

  const backgroundURL = (background: string): string => {
    return background.match(/^url\(["']?(.*?)["']?\)$/)?.[1] || '';
  };

  const decodeImage = async (
    source: string,
    priority?: 'high' | 'low',
  ): Promise<void> => {
    const pending = decoded.get(source);

    if (pending) {
      return pending;
    }

    const loading = (async (): Promise<void> => {
      const image = new Image();

      if (priority) {
        image.fetchPriority = priority;
      }

      image.src = source;
      await image.decode();
    })();

    decoded.set(source, loading);

    try {
      await loading;
    } catch (error) {
      decoded.delete(source);

      throw error;
    }
  };

  const prepareLandscape = async (): Promise<void> => {
    const finalLandscape = scene.querySelector<HTMLElement>('.world-landscape');

    const previewLandscape = scene.querySelector<HTMLElement>(
      '.world-landscape-preview',
    );

    if (
      !finalLandscape ||
      !previewLandscape ||
      !root.hasAttribute('data-js-enabled')
    ) {
      return;
    }

    const styles = getComputedStyle(root);

    const previewSource = backgroundURL(
      styles.getPropertyValue('--landscape-preview'),
    );

    const finalSource = backgroundURL(
      styles.getPropertyValue('--landscape-image'),
    );

    if (!previewSource || !finalSource) {
      return;
    }

    if (unchangedLandscape(finalLandscape, previewSource, finalSource)) {
      return;
    }

    prepared = {
      element: finalLandscape,
      preview: previewSource,
      final: finalSource,
    };

    const request = ++landscapeRequest;

    root.removeAttribute('data-landscape-ready');
    root.removeAttribute('data-landscape-preview-failed');
    finalLandscape.style.backgroundImage = 'none';

    try {
      await decodeImage(previewSource);
    } catch {
      if (request === landscapeRequest) {
        finalLandscape.style.backgroundImage = `url("${finalSource}")`;
        root.dataset.landscapePreviewFailed = 'true';
      }

      return;
    }

    if (request !== landscapeRequest) {
      return;
    }

    try {
      await decodeImage(finalSource, 'low');
    } catch {
      if (request === landscapeRequest) {
        prepared = undefined;
      }

      return;
    }

    if (
      request === landscapeRequest &&
      finalSource ===
        backgroundURL(
          getComputedStyle(root)
            .getPropertyValue('--landscape-image'),
        ) &&
      previewSource ===
        backgroundURL(
          getComputedStyle(root)
            .getPropertyValue('--landscape-preview'),
        )
    ) {
      finalLandscape.style.backgroundImage = `url("${finalSource}")`;
      root.dataset.landscapeReady = 'true';
    }
  };

  const schedule = (): void => {
    void prepareLandscape();
  };

  const observer = new MutationObserver(schedule);

  observer.observe(root, {
    attributes: true,
    attributeFilter: [
      'data-theme',
    ],
  });

  const colorScheme = matchMedia('(prefers-color-scheme: light)');

  const cleanup = [
    on(colorScheme, 'change', schedule),
    on(window, 'resize', schedule, {
      passive: true,
    }),
  ];

  schedule();

  return (): void => {
    landscapeRequest += 1;
    observer.disconnect();
    cleanup.forEach((dispose): void => {
      dispose();
    });
  };
}
