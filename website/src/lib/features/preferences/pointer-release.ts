import type { PointerInput } from './audio.types.ts';
import type { PointerFeedbackState } from './audio-controller.types.ts';
import { finishPointerRelease } from './finish-pointer-release.ts';
import { validPointerInput } from './valid-pointer-input.ts';

export function pointerRelease(
  state: PointerFeedbackState,
  event: PointerInput,
): void {
  const input = {
    state,
    event,
  };

  if (!validPointerInput(input) || state.pressed !== event.pointerId) {
    return;
  }

  state.pressed = undefined;

  if (!state.player.ready('release')) {
    return;
  }

  const remaining = 80 - (state.clock.now() - state.pressedAt);

  if (remaining <= 0) {
    state.player.play('release');

    return;
  }

  state.released = event.pointerId;

  const finish = finishPointerRelease.bind(null, state);

  state.cancelRelease = state.clock.delay(finish, remaining);
}
