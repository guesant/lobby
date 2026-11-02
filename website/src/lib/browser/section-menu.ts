function menuGeometry(
  trigger: HTMLElement,
  navigation: Element,
  panel: HTMLElement,
): {
  placement: 'above' | 'below';
  available: number;
} {
  const rect = navigation.getBoundingClientRect();

  const gap = parseFloat(getComputedStyle(panel).marginBlockStart);

  const below = window.innerHeight - rect.bottom - gap * 2;

  const above = rect.top - gap * 2;

  const minimum = parseFloat(getComputedStyle(trigger).minHeight) * 3;

  if (below < Math.min(minimum, above)) {
    return {
      placement: 'above',
      available: above,
    };
  }

  return {
    placement: 'below',
    available: below,
  };
}

class SectionMenu {
  #menu: HTMLDetailsElement;

  #controller = new AbortController();

  constructor(menu: HTMLDetailsElement) {
    this.#menu = menu;

    const signal = this.#controller.signal;

    document.addEventListener('toggle', this.#toggle.bind(this), {
      capture: true,
      signal,
    });
    document.addEventListener('keydown', this.#keydown.bind(this), {
      signal,
    });
    document.addEventListener('pointerdown', this.#pointerdown.bind(this), {
      signal,
    });
    document.addEventListener('focusin', this.#focusin.bind(this), {
      signal,
    });
    window.addEventListener('resize', this.#position.bind(this), {
      signal,
    });
    document.addEventListener('scroll', this.#position.bind(this), {
      passive: true,
      capture: true,
      signal,
    });
  }

  #position(): void {
    if (!this.#menu.open) {
      return;
    }

    const trigger = this.#menu.querySelector<HTMLElement>('summary');

    const panel = this.#menu.querySelector<HTMLElement>('.section-menu');

    const navigation = this.#menu.closest('.page-navigation');

    if (!trigger || !panel || !navigation) {
      return;
    }

    const geometry = menuGeometry(trigger, navigation, panel);

    this.#menu.dataset['placement'] = geometry.placement;
    this.#menu.style.setProperty(
      '--navigation-available-height',
      `${String(Math.max(0, geometry.available))}px`,
    );
  }

  #focusSummary(): void {
    this.#menu.querySelector('summary')
      ?.focus({
        preventScroll: true,
      });
  }

  #toggle(event: Event): void {
    if (
      event.target instanceof Element &&
      event.target.matches('[data-section-switcher]')
    ) {
      this.#position();
    }
  }

  #keydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.#menu.open) {
      return;
    }

    event.preventDefault();
    this.#menu.open = false;
    this.#focusSummary();
  }

  #pointerdown(event: PointerEvent): void {
    if (
      !this.#menu.open ||
      !(event.target instanceof Node) ||
      this.#menu.contains(event.target)
    ) {
      return;
    }

    const restoreFocus = this.#menu.contains(document.activeElement);

    this.#menu.open = false;

    if (restoreFocus) {
      this.#focusSummary();
    }
  }

  #focusin(event: FocusEvent): void {
    if (
      this.#menu.open &&
      event.target instanceof Node &&
      !this.#menu.contains(event.target)
    ) {
      this.#menu.open = false;
    }
  }

  destroy(): void {
    this.#controller.abort();
  }
}

export function sectionMenu(menu: HTMLDetailsElement): () => void {
  const controls = new SectionMenu(menu);

  return controls.destroy.bind(controls);
}
