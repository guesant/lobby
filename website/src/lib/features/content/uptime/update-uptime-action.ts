import { formatUptime } from '../format-uptime.viewmodel.ts';
import type { UptimeActionState, UptimeProps } from './uptime.types.ts';

export function updateUptimeAction(
  state: UptimeActionState,
  props: UptimeProps,
): void {
  state.props = props;

  const now = new Date();

  state.element.textContent = formatUptime(props.birthDate, now, props.locale);

  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  const update = updateUptimeAction.bind(null, state, props);

  const delay = midnight.getTime() - now.getTime();

  state.timer = setTimeout(update, delay);
}
