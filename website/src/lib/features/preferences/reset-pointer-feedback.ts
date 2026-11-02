import type { PointerFeedbackState } from './audio-controller.types.ts';

export function resetPointerFeedback(state: PointerFeedbackState): void {
  state.pressed = undefined;
  state.released = undefined;
  state.cancelRelease?.();
  state.cancelRelease = undefined;
  state.player.stop();
}
