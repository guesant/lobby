import type { PointerSoundState } from './pointer-sound.types.ts';

export function destroyPointerSound(state: PointerSoundState): void {
  state.controller.abort();
  state.feedback.destroy();
}
