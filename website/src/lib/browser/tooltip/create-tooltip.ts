import { dismissTooltip } from './dismiss-tooltip.ts';
import { disposeTooltip } from './dispose-tooltip.ts';
import { focusTarget } from './focus-target.ts';
import { showTooltip } from './show-tooltip.ts';
import { on } from 'svelte/events';

export function tooltip(node: HTMLElement): () => void {
  const show = showTooltip.bind(null, node);

  const focusable = focusTarget(node);

  const dismiss = dismissTooltip.bind(null, node);

  const disposers = [
    on(node, 'pointerenter', show),
    on(focusable, 'focusin', show),
    on(document, 'keydown', dismiss),
  ];

  return disposeTooltip.bind(null, disposers);
}
