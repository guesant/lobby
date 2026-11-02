import type { Preferences } from './preferences.types.ts';

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
