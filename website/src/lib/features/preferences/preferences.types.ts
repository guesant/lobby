export type Appearance = 'system' | 'dark' | 'light';

export type DialogName = 'none' | 'search' | 'credits' | 'settings' | 'consent';

export type AnalyticsConsent = 'unknown' | 'granted' | 'denied';

export type Preferences = {
  theme: Appearance;
  view: 'compact' | 'detailed';
  motion: 'on' | 'off';
  sound: 'on' | 'off';
};

export type InterfaceState = Preferences & {
  dialog: DialogName;
  reducedMotion: boolean;
  analyticsConsent: AnalyticsConsent;
  analyticsConsentLoaded: boolean;
};

export type PreferenceStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StorageAccess = () => PreferenceStorage;
