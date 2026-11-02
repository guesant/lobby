import { on } from 'svelte/events';

function focusTarget(node: HTMLElement): HTMLElement {
  if (node instanceof HTMLLabelElement && node.control) {
    return node.control;
  }

  return node;
}

export function tooltip(node: HTMLElement): () => void {
  function position(): void {
    delete node.dataset['tooltipDismissed'];

    const content = node.querySelector<HTMLElement>('.control-tooltip');

    if (!content) {
      return;
    }

    const shift = measureTooltip(content);

    content.style.setProperty('--tooltip-shift', `${String(shift)}px`);
    content.style.removeProperty('display');
    content.style.removeProperty('visibility');
  }

  const disposers = [
    on(node, 'pointerenter', position),
    on(focusTarget(node), 'focusin', position),
    on(document, 'keydown', (event): void => {
      if (event.key === 'Escape') {
        node.dataset['tooltipDismissed'] = 'true';
      }
    }),
  ];

  return (): void => {
    disposers.forEach((dispose): void => {
      dispose();
    });
  };
}

function measureTooltip(content: HTMLElement): number {
  content.style.display = 'block';
  content.style.visibility = 'hidden';
  content.style.removeProperty('--tooltip-shift');

  return tooltipShift(content.getBoundingClientRect());
}

function tooltipShift(rect: DOMRect): number {
  const gutter =
    parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue(
          '--page-gutter',
        ),
    ) || 0;

  if (rect.left < gutter) {
    return gutter - rect.left;
  }

  if (rect.right > innerWidth - gutter) {
    return innerWidth - gutter - rect.right;
  }

  return 0;
}
