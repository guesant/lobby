import type { PointerFeedback } from '../features/preferences/audio.types.ts';

export function resetHiddenPointer(feedback: PointerFeedback): void {
  if (document.hidden) {
    feedback.reset();
  }
}
