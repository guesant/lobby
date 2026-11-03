import type { InterfaceController } from '../navigation/interface.types.ts';
import type { PreferenceController } from './preference-controller.types.ts';

export type SettingsActions = {
  preferences: PreferenceController;
  interfaceActions: InterfaceController;
};
