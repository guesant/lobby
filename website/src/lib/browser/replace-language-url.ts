import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export async function replaceLanguageURL(url: URL): Promise<void> {
  const route = `${url.pathname.slice(1)}${url.search}${url.hash}`;

  const destination = resolve(route);

  await goto(destination, {
    state: page.state,
    shallow: true,
    replace: true,
    reset: false,
  });
}
