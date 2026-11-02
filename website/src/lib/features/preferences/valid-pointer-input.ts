import type { PointerFeedbackInput } from './audio-controller.types.ts';

export function validPointerInput(input: PointerFeedbackInput): boolean {
  return (
    input.state.enabled &&
    input.event.isTrusted &&
    input.event.pointerType === 'mouse' &&
    input.event.button === 0
  );
}
