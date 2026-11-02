import type { ErrorPageActionProps } from './error-page-action.types.ts';
import { mountErrorPage } from './mount-error-page.ts';

export function updateErrorPage(
  _element: HTMLElement,
  props: ErrorPageActionProps,
): void {
  mountErrorPage(
    {
      locales: props.locales,
    },
    props.state,
  );
}
