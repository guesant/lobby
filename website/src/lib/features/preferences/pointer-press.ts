import type { PointerInput } from './audio.types.ts';
import type { PointerFeedbackState } from './audio-controller.types.ts';
import { resetPointerFeedback } from './reset-pointer-feedback.ts';
import { validPointerInput } from './valid-pointer-input.ts';

export function pointerPress(
  state: PointerFeedbackState,
  event: PointerInput,
): void {
  const input = {
    state,
    event,
  };

  if (!validPointerInput(input)) {
    return;
  }

  resetPointerFeedback(state);
  state.player.resume();

  if (!state.player.ready('press')) {
    return;
  }

  state.pressed = event.pointerId;
  state.pressedAt = state.clock.now();
  state.player.play('press');
}
