import type { PointerSound } from '../features/preferences/audio.types.ts';
import type { InterfaceState } from '../features/preferences/preferences.types.ts';

export type BrowserEnvironment = {
  update: (state: InterfaceState) => void;
  destroy: () => void;
};

export type BrowserEnvironmentState = {
  controls: InterfaceState;
  sound: PointerSound;
  media: MediaQueryList;
  stopMedia?: () => void;
};
