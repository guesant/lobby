import type { PointerFeedbackState } from './audio-controller.types.ts';

export function finishPointerRelease(state: PointerFeedbackState): void {
  state.released = undefined;
  state.cancelRelease = undefined;

  if (state.enabled) {
    state.player.play('release');
  }
}
