import type { PointerFeedbackState } from './audio-controller.types.ts';
import { resetPointerFeedback } from './reset-pointer-feedback.ts';

export function cancelPointerFeedback(
  state: PointerFeedbackState,
  pointerId: number,
): void {
  if (state.pressed === pointerId || state.released === pointerId) {
    resetPointerFeedback(state);
  }
}
