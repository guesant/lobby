import { on } from 'svelte/events';

function focusTarget(node: HTMLElement): HTMLElement {
  if (node instanceof HTMLLabelElement && node.control) {
    return node.control;
  }

  return node;
}

export function tooltip(node: HTMLElement): () => void {
  const position = (): void => {
    delete node.dataset.tooltipDismissed;

    const content = node.querySelector<HTMLElement>('.control-tooltip');

    if (!content) {
      return;
    }

    content.style.display = 'block';
    content.style.visibility = 'hidden';
    content.style.removeProperty('--tooltip-shift');

    const rect = content.getBoundingClientRect();

    const gutter =
      parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue(
            '--page-gutter',
          ),
      ) || 0;

    let shift = 0;

    if (rect.left < gutter) {
      shift = gutter - rect.left;
    } else if (rect.right > innerWidth - gutter) {
      shift = innerWidth - gutter - rect.right;
    }

    content.style.setProperty('--tooltip-shift', `${shift}px`);
    content.style.removeProperty('display');
    content.style.removeProperty('visibility');
  };

  const disposers = [
    on(node, 'pointerenter', position),
    on(focusTarget(node), 'focusin', position),
    on(document, 'keydown', (event): void => {
      if (event.key === 'Escape') {
        node.dataset.tooltipDismissed = 'true';
      }
    }),
  ];

  return (): void => {
    disposers.forEach((dispose): void => {
      dispose();
    });
  };
}
