import type {
  PointerFeedback,
  SoundPlayer,
  SoundTiming,
} from './audio.types.ts';
import type { PointerFeedbackState } from './audio-controller.types.ts';
import { cancelPointerFeedback } from './cancel-pointer-feedback.ts';
import { destroyPointerFeedback } from './destroy-pointer-feedback.ts';
import { pointerPress } from './pointer-press.ts';
import { pointerRelease } from './pointer-release.ts';
import { resetPointerFeedback } from './reset-pointer-feedback.ts';
import { setPointerFeedback } from './set-pointer-feedback.ts';

export function createPointerFeedback(
  player: SoundPlayer,
  enabled: boolean,
  clock: SoundTiming,
): PointerFeedback {
  const state: PointerFeedbackState = {
    enabled,
    pressed: undefined,
    released: undefined,
    pressedAt: 0,
    cancelRelease: undefined,
    player,
    clock,
  };

  if (enabled) {
    player.prepare();
  }

  return {
    press: pointerPress.bind(null, state),
    release: pointerRelease.bind(null, state),
    cancel: cancelPointerFeedback.bind(null, state),
    reset: resetPointerFeedback.bind(null, state),
    setEnabled: setPointerFeedback.bind(null, state),
    destroy: destroyPointerFeedback.bind(null, state),
  };
}
