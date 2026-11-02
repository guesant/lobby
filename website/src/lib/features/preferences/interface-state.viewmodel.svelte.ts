import type { InterfaceState } from './preferences.model.ts';
import { interfaceStateContext } from './preferences-context.model.ts';
import { getContext } from 'svelte';

export function interfaceState(): InterfaceState {
  return getContext<InterfaceState>(interfaceStateContext);
}
