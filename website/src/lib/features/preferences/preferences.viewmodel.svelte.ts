import type { InterfaceState } from './preferences.model.ts';
import { defaultPreferences } from './preferences.model.ts';
import { getContext, setContext } from 'svelte';

const contextKey = Symbol('lobby-interface-state');

export function provideInterfaceState(): InterfaceState {
  const controls = $state<InterfaceState>(defaultPreferences());

  setContext(contextKey, controls);

  return controls;
}

export function interfaceState(): InterfaceState {
  return getContext<InterfaceState>(contextKey);
}
