import type {
  InterfaceState,
  PreferenceStorage,
} from '../preferences/preferences.types.ts';

export type ConsentContext = {
  controls: InterfaceState;
  storage: () => PreferenceStorage;
};

export type ConsentController = {
  restore: () => void;
  set: (status: 'granted' | 'denied') => void;
};
