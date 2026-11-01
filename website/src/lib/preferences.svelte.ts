import { getContext, setContext } from 'svelte';

type Appearance = 'system' | 'dark' | 'light';

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

const contextKey = Symbol('lobby-interface-state');

const keys: (keyof Preferences)[] = [
  'theme',
  'view',
  'motion',
  'sound',
];

type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>;

const storage: StorageAccess = (): Storage => {
  return localStorage;
};

export function provideInterfaceState(): InterfaceState {
  const controls = $state<InterfaceState>({
    theme: 'system',
    view: 'compact',
    motion: 'on',
    sound: 'on',
    dialog: 'none',
    reducedMotion: false,
  });

  setContext(contextKey, controls);

  return controls;
}

export function interfaceState(): InterfaceState {
  return getContext<InterfaceState>(contextKey);
}

export function assignPreference(
  controls: InterfaceState,
  key: keyof Preferences,
  value: string,
): boolean {
  if (
    key === 'theme' &&
    (value === 'system' || value === 'light' || value === 'dark')
  ) {
    controls.theme = value;

    return true;
  }

  if (key === 'view' && (value === 'compact' || value === 'detailed')) {
    controls.view = value;

    return true;
  }

  if (
    (key === 'motion' || key === 'sound') &&
    (value === 'on' || value === 'off')
  ) {
    controls[key] = value;

    return true;
  }

  return false;
}

export function setPreference(
  controls: InterfaceState,
  key: keyof Preferences,
  value: string,
  access: StorageAccess = storage,
): void {
  if (!assignPreference(controls, key, value)) {
    return;
  }

  try {
    access()
      .setItem(`guesant-links-${key}`, value);
  } catch {}
}

export function restorePreferences(
  controls: InterfaceState,
  access: StorageAccess = storage,
): void {
  for (const key of keys) {
    try {
      const saved = access()
        .getItem(`guesant-links-${key}`);

      if (saved !== null) {
        assignPreference(controls, key, saved);
      }
    } catch {}
  }
}
