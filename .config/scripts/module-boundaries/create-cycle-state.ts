import type { CycleState } from './cycle-state.types.ts';

export function createCycleState(): CycleState {
  return {
    active: new Map(),
    path: [],
    visited: new Set(),
    cycles: [],
  };
}
