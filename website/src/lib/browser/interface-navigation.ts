import type { PageLoadData } from '../features/content/content.types.ts';
import { createInterfaceController } from '../features/navigation/interface.controller.ts';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export function createBrowserInterfaceController(
  page: () => PageLoadData,
  closeDialog: () => void,
): ReturnType<typeof createInterfaceController> {
  return createInterfaceController({
    page,
    closeDialog,
    currentURL(): URL {
      return new URL(window.location.href);
    },
    async navigate(url): Promise<void> {
      await goto(resolve(`${url.pathname.slice(1)}${url.search}${url.hash}`), {
        reset: true,
      });
    },
  });
}
