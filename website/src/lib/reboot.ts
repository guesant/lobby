export function reboot(event: MouseEvent): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();

  const target = rebootURL(new URL(window.location.href));

  window.location.assign(target.href);
}

import { rebootURL } from './interface-navigation.ts';
