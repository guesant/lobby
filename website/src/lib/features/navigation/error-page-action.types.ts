import type { ErrorPageState } from './error-page-state.types.ts';
import type { ErrorLocale } from './not-found.types.ts';

export type ErrorPageActionProps = {
  locales: ErrorLocale[];
  state: ErrorPageState;
};
