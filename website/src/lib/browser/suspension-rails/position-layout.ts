import { positionLanterns } from './position-lanterns.ts';
import type { RailLayoutState } from './rail-layout.types.ts';

export function positionLayout(state: RailLayoutState): void {
  state.frame = null;

  const lanes = new Map<HTMLElement, number>();

  for (const body of state.content.querySelectorAll<HTMLElement>(
    '.suspension-body',
  )) {
    if (body.getClientRects().length) {
      const bounds = body.getBoundingClientRect();

      lanes.set(body, bounds.top);
    }
  }

  if (!lanes.size) {
    return;
  }

  const anchors = [
    ...state.content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
  ];

  if (!anchors.length) {
    return;
  }

  const styles = getComputedStyle(state.content);

  const rowGap = styles.rowGap;

  const gap = parseFloat(rowGap);

  const anchorBottoms: number[] = [];

  for (const anchor of anchors) {
    const bounds = anchor.getBoundingClientRect();

    anchorBottoms.push(bounds.bottom);
  }

  for (const [
    body,
    top,
  ] of lanes) {
    positionLanterns(body, anchorBottoms, gap / 2 - top);
  }
}
