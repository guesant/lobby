import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export async function navigateLanguage(url: URL): Promise<void> {
  const route = `${url.pathname.slice(1)}${url.search}${url.hash}`;

  const destination = resolve(route);

  await goto(destination, {
    replace: true,
    reset: false,
  });

  if (page.status >= 400) {
    throw new Error('Language destination could not be loaded');
  }
}
