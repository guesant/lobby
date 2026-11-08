import type { ErrorPageState } from './error-page-state.types.ts';
import type { ErrorLocale } from './not-found.types.ts';
import { initializeErrorPage } from '#lib/browser/error-page.ts';

export function mountErrorPage(
  data: {
    locales: ErrorLocale[];
  },
  state: ErrorPageState,
): void {
  const presentation = initializeErrorPage(data.locales);

  state.selected = presentation.selected;
}
