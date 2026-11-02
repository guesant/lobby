export type Appearance = 'system' | 'dark' | 'light';

type LinkView = 'compact' | 'detailed';

type Toggle = 'on' | 'off';

type DialogName = 'none' | 'search' | 'credits' | 'settings';

export type Preferences = {
  theme: Appearance;
  view: LinkView;
  motion: Toggle;
  sound: Toggle;
};

export type InterfaceState = Preferences & {
  dialog: DialogName;
  reducedMotion: boolean;
};

export type PreferenceStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StorageAccess = () => PreferenceStorage;

export const preferenceOptions: {
  [Key in keyof Preferences]: readonly Preferences[Key][];
} = {
  theme: [
    'system',
    'light',
    'dark',
  ],
  view: [
    'compact',
    'detailed',
  ],
  motion: [
    'on',
    'off',
  ],
  sound: [
    'on',
    'off',
  ],
};

export const preferenceKeys: (keyof Preferences)[] = [
  'theme',
  'view',
  'motion',
  'sound',
];

export function defaultPreferences(): InterfaceState {
  return {
    theme: 'system',
    view: 'compact',
    motion: 'on',
    sound: 'on',
    dialog: 'none',
    reducedMotion: false,
  };
}

function validPreference<Key extends keyof Preferences>(
  key: Key,
  value: string,
): value is Preferences[Key] {
  return preferenceOptions[key].some((option): boolean => {
    return option === value;
  });
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- IMPORTANT: Key preserves the correlation between indexed preference values and their destination; a union produces an unassignable intersection.
export function assignPreference<Key extends keyof Preferences>(
  controls: Preferences,
  key: Key,
  value: string,
): boolean {
  if (!validPreference(key, value)) {
    return false;
  }

  controls[key] = value;

  return true;
}
