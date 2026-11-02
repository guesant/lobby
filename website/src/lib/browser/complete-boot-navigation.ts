import { consumeBootRequest } from '../features/navigation/consume-boot-request.model.ts';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export async function completeBootNavigation(start: () => void): Promise<void> {
  const target = consumeBootRequest(new URL(window.location.href));

  if (!target) {
    return;
  }

  const route = `${target.pathname.slice(1)}${target.search}${target.hash}`;

  const destination = resolve(route);

  await goto(destination, {
    state: page.state,
    shallow: true,
    replace: true,
    reset: false,
  });
  start();
}
