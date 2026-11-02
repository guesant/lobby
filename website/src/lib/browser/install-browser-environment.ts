import pointerPress from '../../assets/audio/mouse-press.wav';
import pointerRelease from '../../assets/audio/mouse-release.wav';
import type { InterfaceState } from '../features/preferences/preferences.model.ts';
import type { BrowserEnvironment } from './browser-environment.types.ts';
import type { BrowserEnvironmentState } from './browser-environment.types.ts';
import { destroyBrowserEnvironment } from './destroy-browser-environment.ts';
import { createPointerSound } from './pointer-sound.ts';
import { updateBrowserEnvironment } from './update-browser-environment.ts';
import { updateReducedMotion } from './update-reduced-motion.ts';
import { updateVisibility } from './update-visibility.ts';
import { on } from 'svelte/events';

export function installBrowserEnvironment(
  controls: InterfaceState,
): BrowserEnvironment {
  const sound = createPointerSound(
    {
      pointerPress,
      pointerRelease,
    },
    controls.sound === 'on',
  );

  const media = matchMedia('(prefers-reduced-motion: reduce)');

  const state: BrowserEnvironmentState = {
    controls,
    sound,
    media,
  };

  const updateMotion = updateReducedMotion.bind(null, state);

  updateMotion();
  updateBrowserEnvironment(state, controls);
  updateVisibility();
  state.stopMedia = on(media, 'change', updateMotion);

  return {
    update: updateBrowserEnvironment.bind(null, state),
    destroy: destroyBrowserEnvironment.bind(null, state),
  };
}
