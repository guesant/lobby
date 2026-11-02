import pointerPress from '../../assets/audio/mouse-press.wav';
import pointerRelease from '../../assets/audio/mouse-release.wav';
import type { InterfaceState } from '../features/preferences/preferences.model.ts';
import { createPointerSound } from './pointer-sound.ts';
import { on } from 'svelte/events';

export type BrowserEnvironment = {
  update: (state: InterfaceState) => void;
  destroy: () => void;
};

export function updateVisibility(): void {
  document.documentElement.dataset['pageHidden'] = String(document.hidden);
}

function applyPreferences(state: InterfaceState): void {
  const attributes = document.documentElement.dataset;

  attributes['theme'] = state.theme;
  attributes['themeReady'] = 'true';
  attributes['linkView'] = state.view;
  attributes['linkViewReady'] = 'true';
  attributes['sound'] = state.sound;
  attributes['motion'] = state.motion;

  if (state.reducedMotion) {
    attributes['motion'] = 'off';
  }
}

export function installBrowserEnvironment(
  state: InterfaceState,
): BrowserEnvironment {
  const sound = createPointerSound(
    {
      pointerPress,
      pointerRelease,
    },
    state.sound === 'on',
  );

  const media = matchMedia('(prefers-reduced-motion: reduce)');

  function updateMotion(): void {
    state.reducedMotion = media.matches;
  }

  function update(current: InterfaceState): void {
    applyPreferences(current);
    sound.setEnabled(current.sound === 'on');
  }

  updateMotion();
  update(state);
  updateVisibility();

  const stopMedia = on(media, 'change', updateMotion);

  function destroy(): void {
    sound.destroy();
    stopMedia();
  }

  return {
    update,
    destroy,
  };
}
