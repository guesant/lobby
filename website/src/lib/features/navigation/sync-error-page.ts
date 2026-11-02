import type { ErrorPageActionProps } from './error-page-action.types.ts';
import { updateErrorPage } from './update-error-page.ts';

export function syncErrorPage(
  element: HTMLElement,
  props: ErrorPageActionProps,
): {
  update: (props: ErrorPageActionProps) => void;
} {
  updateErrorPage(element, props);

  return {
    update: updateErrorPage.bind(null, element),
  };
}
