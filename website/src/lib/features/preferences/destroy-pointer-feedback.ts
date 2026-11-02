import type { PointerFeedbackState } from './audio-controller.types.ts';
import { resetPointerFeedback } from './reset-pointer-feedback.ts';

export function destroyPointerFeedback(state: PointerFeedbackState): void {
  state.enabled = false;
  resetPointerFeedback(state);
  state.player.destroy();
}
