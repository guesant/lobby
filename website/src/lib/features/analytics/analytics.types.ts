import type { AnalyticsConsent } from '../preferences/preferences.types.ts';

export type ConsentRecord = {
  version: 1;
  status: Exclude<AnalyticsConsent, 'unknown'>;
  updatedAt: number;
};

export type AnalyticsTagWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...arguments_: unknown[]) => void;
  lobbyAnalyticsID?: string;
};
