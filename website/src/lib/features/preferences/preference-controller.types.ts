import type { Preferences, StorageAccess } from './preferences.types.ts';

export type PreferenceController = {
  set: (key: keyof Preferences, value: string) => void;
  restore: () => void;
};

export type PreferenceContext = {
  controls: Preferences;
  access: StorageAccess;
};
