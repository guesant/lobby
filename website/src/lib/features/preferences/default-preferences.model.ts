import type { InterfaceState } from './preferences.types.ts';

export function defaultPreferences(): InterfaceState {
  return {
    theme: 'system',
    view: 'compact',
    motion: 'on',
    sound: 'on',
    dialog: 'none',
    reducedMotion: false,
    analyticsConsent: 'unknown',
    analyticsConsentLoaded: false,
  };
}
