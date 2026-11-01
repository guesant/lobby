export function sectionMenu(menu: HTMLDetailsElement): () => void {
  const controller = new AbortController();

  const getSwitcher = (): HTMLDetailsElement | null => {
    return menu;
  };

  const position = (): void => {
    const switcher = getSwitcher();

    if (!(switcher instanceof HTMLDetailsElement) || !switcher.open) {
      return;
    }

    const trigger = switcher.querySelector<HTMLElement>('summary');

    const panel = switcher.querySelector<HTMLElement>('.section-menu');

    const navigation = switcher.closest('.page-navigation');

    if (!trigger || !panel || !navigation) {
      return;
    }

    const rect = navigation.getBoundingClientRect();

    const gap = parseFloat(getComputedStyle(panel).marginBlockStart);

    const below = window.innerHeight - rect.bottom - gap * 2;

    const above = rect.top - gap * 2;

    const minimum = parseFloat(getComputedStyle(trigger).minHeight) * 3;

    const upwards = below < Math.min(minimum, above);

    const menuPlacement = (): 'above' | 'below' => {
      if (upwards) {
        return 'above';
      }

      return 'below';
    };

    switcher.dataset.placement = menuPlacement();

    const availableMenuHeight = (): number => {
      if (upwards) {
        return above;
      }

      return below;
    };

    switcher.style.setProperty(
      '--navigation-available-height',
      `${Math.max(0, availableMenuHeight())}px`,
    );
  };

  document.addEventListener(
    'toggle',
    (event): void => {
      if (
        event.target instanceof Element &&
        event.target.matches('[data-section-switcher]')
      ) {
        position();
      }
    },
    {
      capture: true,
      signal: controller.signal,
    },
  );
  document.addEventListener(
    'keydown',
    (event): void => {
      const switcher = getSwitcher();

      if (event.key !== 'Escape' || !switcher?.open) {
        return;
      }

      event.preventDefault();
      switcher.open = false;
      switcher.querySelector('summary')
        ?.focus({
          preventScroll: true,
        });
    },
    {
      signal: controller.signal,
    },
  );
  document.addEventListener(
    'pointerdown',
    (event): void => {
      const switcher = getSwitcher();

      if (
        !switcher?.open ||
        !(event.target instanceof Node) ||
        switcher.contains(event.target)
      ) {
        return;
      }

      const restoreFocus = switcher.contains(document.activeElement);

      switcher.open = false;

      if (restoreFocus) {
        switcher.querySelector('summary')
          ?.focus({
            preventScroll: true,
          });
      }
    },
    {
      signal: controller.signal,
    },
  );
  document.addEventListener(
    'focusin',
    (event): void => {
      const switcher = getSwitcher();

      if (
        switcher?.open &&
        event.target instanceof Node &&
        !switcher.contains(event.target)
      ) {
        switcher.open = false;
      }
    },
    {
      signal: controller.signal,
    },
  );
  window.addEventListener('resize', position, {
    signal: controller.signal,
  });
  document.addEventListener('scroll', position, {
    passive: true,
    capture: true,
    signal: controller.signal,
  });

  return (): void => {
    controller.abort();
  };
}
