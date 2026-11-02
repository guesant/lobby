import type { InterfaceState } from './preferences.model.ts';
import { defaultPreferences } from './preferences.model.ts';
import { interfaceStateContext } from './preferences-context.model.ts';
import { setContext } from 'svelte';

export function provideInterfaceState(): InterfaceState {
  const defaults = defaultPreferences();

  const controls = $state<InterfaceState>(defaults);

  setContext(interfaceStateContext, controls);

  return controls;
}
