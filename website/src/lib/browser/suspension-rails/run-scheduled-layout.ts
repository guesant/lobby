import { positionLayout } from './position-layout.ts';
import type { RailLayoutState } from './rail-layout.types.ts';

export function runScheduledLayout(state: RailLayoutState): void {
  positionLayout(state);
}
