import { tooltipShift } from './tooltip-shift.ts';

export function measureTooltip(content: HTMLElement): number {
  content.style.display = 'block';
  content.style.visibility = 'hidden';
  content.style.removeProperty('--tooltip-shift');

  const bounds = content.getBoundingClientRect();

  return tooltipShift(bounds);
}
