import { ignoreAudioFailure } from './ignore-audio-failure.ts';
import { stopAudio } from './stop-audio.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function destroyAudio(state: WebAudioState): void {
  state.controller.abort();
  stopAudio(state);
  void state.context?.close()
    .catch(ignoreAudioFailure);
}
