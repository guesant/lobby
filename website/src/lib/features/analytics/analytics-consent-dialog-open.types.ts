import type {
  AnalyticsConsent,
  DialogName,
} from '../preferences/preferences.types.ts';

export type ConsentDialogState = {
  measurementID: string;
  consent: AnalyticsConsent;
  loaded: boolean;
  dialog: DialogName;
};
