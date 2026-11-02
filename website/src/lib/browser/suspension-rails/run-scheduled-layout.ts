import { positionLayout } from './position-layout.ts';
import type { RailLayoutState } from './rail-layout.model.ts';

export function runScheduledLayout(state: RailLayoutState): void {
  positionLayout(state);
}
