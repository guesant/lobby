import { cancelPointerEvent } from './cancel-pointer-event.ts';
import type { PointerSoundState } from './pointer-sound.types.ts';
import { resetHiddenPointer } from './reset-hidden-pointer.ts';

export function installPointerListeners(state: PointerSoundState): void {
  const options = {
    capture: true,
    passive: true,
    signal: state.controller.signal,
  };

  document.addEventListener('pointerdown', state.feedback.press, options);
  document.addEventListener('pointerup', state.feedback.release, options);

  const cancelPointer = cancelPointerEvent.bind(null, state.feedback);

  document.addEventListener('pointercancel', cancelPointer, options);
  window.addEventListener('blur', state.feedback.reset, {
    signal: state.controller.signal,
  });

  const resetPointer = resetHiddenPointer.bind(null, state.feedback);

  document.addEventListener('visibilitychange', resetPointer, {
    signal: state.controller.signal,
  });
}
