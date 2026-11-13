import { positionLanterns } from './position-lanterns.ts';
import type { RailLayoutState } from './rail-layout.types.ts';
import { visibleLanes } from './visible-lanes.ts';

export function positionLayout(state: RailLayoutState): void {
  state.frame = null;

  const lanes = visibleLanes(state.content);

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

  const gap = parseFloat(styles.rowGap);

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
