import type { InterfaceState } from '../preferences/preferences.model.ts';
import type { BootState } from './boot.model.ts';

export type BootControllerState = {
  model: BootState;
  preferences: InterfaceState;
  dialog?: HTMLDialogElement;
  previous: HTMLElement | null;
  timer?: ReturnType<typeof setTimeout>;
};

export type BootController = {
  start: () => void;
  finish: () => void;
  destroy: () => void;
};
