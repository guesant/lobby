import type { PointerFeedback } from '../features/preferences/audio.types.ts';
import type { PointerInput } from '../features/preferences/audio.types.ts';

export function cancelPointerEvent(
  feedback: PointerFeedback,
  event: PointerInput,
): void {
  feedback.cancel(event.pointerId);
}
