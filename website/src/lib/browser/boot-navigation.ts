import { consumeBootRequest } from '../features/navigation/interface.model.ts';
import { afterNavigate, goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export function registerBootNavigation(start: () => void): void {
  afterNavigate((navigation): void => {
    void navigation.complete.then(async (): Promise<void> => {
      const target = consumeBootRequest(new URL(window.location.href));

      if (!target) {
        return;
      }

      await goto(
        resolve(`${target.pathname.slice(1)}${target.search}${target.hash}`),
        {
          state: page.state,
          shallow: true,
          replace: true,
          reset: false,
        },
      );
      start();
    });
  });
}
