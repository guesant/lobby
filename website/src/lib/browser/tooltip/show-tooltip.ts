import { measureTooltip } from './measure-tooltip.ts';

export function showTooltip(node: HTMLElement): void {
  delete node.dataset['tooltipDismissed'];

  const content = node.querySelector<HTMLElement>('.control-tooltip');

  if (!content) {
    return;
  }

  const shift = measureTooltip(content);

  const shiftValue = `${String(shift)}px`;

  content.style.setProperty('--tooltip-shift', shiftValue);
  content.style.removeProperty('display');
  content.style.removeProperty('visibility');
}
