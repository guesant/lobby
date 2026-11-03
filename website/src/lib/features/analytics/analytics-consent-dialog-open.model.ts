import type { ConsentDialogState } from './analytics-consent-dialog-open.types.ts';

export function analyticsConsentDialogOpen(state: ConsentDialogState): boolean {
  const {
    measurementID,
    consent,
    loaded,
    dialog
  } = state;

  if (!measurementID || !loaded) {
    return false;
  }

  return dialog === 'consent' || consent === 'unknown';
}
