import type { InterfaceState } from '../features/preferences/preferences.model.ts';

export function applyBrowserPreferences(state: InterfaceState): void {
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
