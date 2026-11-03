import { positionLanterns } from './position-lanterns.ts';
import type { RailLayoutState } from './rail-layout.types.ts';

export function positionLayout(state: RailLayoutState): void {
  state.frame = null;

  const anchors = [
    ...state.content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
  ];

  if (!anchors.length) {
    return;
  }

  const styles = getComputedStyle(state.content);

  const rowGap = styles.rowGap;

  const gap = parseFloat(rowGap);

  for (const body of state.content.querySelectorAll<HTMLElement>(
    '.suspension-body',
  )) {
    positionLanterns(body, anchors, gap);
  }
}
