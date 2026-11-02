import type { InterfaceController } from '../navigation/interface.controller.ts';
import type { PreferenceController } from './preferences.controller.ts';

type SettingsActions = {
  preferences: PreferenceController;
  interfaceActions: InterfaceController;
};

export function updateSettings(actions: SettingsActions, event: Event): void {
  const input = event.currentTarget;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  switch (input.dataset['setting']) {
    case 'sound':
    case 'theme':
    case 'motion':
      actions.preferences.set(input.dataset['setting'], input.value);

      return;

    case 'interface':
      void actions.interfaceActions.select(input.value);
  }
}
