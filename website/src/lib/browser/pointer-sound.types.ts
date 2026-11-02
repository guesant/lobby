import type { PointerFeedback } from '../features/preferences/audio.types.ts';

export type PointerSoundState = {
  feedback: PointerFeedback;
  controller: AbortController;
};

export type PointerSoundURLs = {
  pointerPress: string;
  pointerRelease: string;
};
