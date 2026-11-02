import { destroyUptimeAction } from './destroy-uptime-action.ts';
import { updateUptimeAction } from './update-uptime-action.ts';
import type { UptimeActionState, UptimeProps } from './uptime.types.ts';

export function uptime(
  element: HTMLTimeElement,
  props: UptimeProps,
): {
  update: (props: UptimeProps) => void;
  destroy: () => void;
} {
  const state: UptimeActionState = {
    element,
    props,
  };

  updateUptimeAction(state, props);

  return {
    update: updateUptimeAction.bind(null, state),
    destroy: destroyUptimeAction.bind(null, state),
  };
}
