import type { PointerFeedbackState } from './audio-controller.types.ts';
import { resetPointerFeedback } from './reset-pointer-feedback.ts';

export function setPointerFeedback(
  state: PointerFeedbackState,
  enabled: boolean,
): void {
  state.enabled = enabled;

  if (!enabled) {
    resetPointerFeedback(state);

    return;
  }

  state.player.prepare();
}
