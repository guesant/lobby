import type { UptimeActionState } from './uptime.types.ts';

export function destroyUptimeAction(state: UptimeActionState): void {
  if (state.timer !== undefined) {
    clearTimeout(state.timer);
  }
}
