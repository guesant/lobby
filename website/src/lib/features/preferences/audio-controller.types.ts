import type { PointerInput, SoundPlayer, SoundTiming } from './audio.types.ts';

export type PointerFeedbackState = {
  enabled: boolean;
  pressed: number | undefined;
  released: number | undefined;
  pressedAt: number;
  cancelRelease: (() => void) | undefined;
  player: SoundPlayer;
  clock: SoundTiming;
};

export type PointerFeedbackInput = {
  state: PointerFeedbackState;
  event: PointerInput;
};
