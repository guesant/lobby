import type { PointerSoundState } from './pointer-sound.types.ts';

export function setPointerSoundEnabled(
  state: PointerSoundState,
  enabled: boolean,
): void {
  state.feedback.setEnabled(enabled);
}
