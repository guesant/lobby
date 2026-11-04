import type { ErrorPageState } from './error-page-state.types.ts';

export function errorInterfaceName(state: ErrorPageState): string {
  if (state.terminal) {
    return 'terminal';
  }

  if (state.selected) {
    return 'voxel';
  }

  return 'neutral';
}
