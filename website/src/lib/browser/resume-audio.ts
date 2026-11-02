import { ignoreAudioFailure } from './ignore-audio-failure.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function resumeAudio(state: WebAudioState): void {
  if (state.context?.state !== 'suspended') {
    return;
  }

  try {
    void state.context.resume()
      .catch(ignoreAudioFailure);
  } catch {
    return;
  }
}
