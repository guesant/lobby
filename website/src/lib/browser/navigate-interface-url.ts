import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export async function navigateInterfaceURL(url: URL): Promise<void> {
  const route = `${url.pathname.slice(1)}${url.search}${url.hash}`;

  const destination = resolve(route);

  await goto(destination, {
    reset: true,
  });
}
