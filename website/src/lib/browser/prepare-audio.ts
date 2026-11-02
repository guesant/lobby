import { audioContextConstructor } from './audio-context-constructor.ts';
import { ignoreAudioFailure } from './ignore-audio-failure.ts';
import { initializeAudio } from './initialize-audio.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function prepareAudio(state: WebAudioState): void {
  if (state.context !== undefined || state.controller.signal.aborted) {
    return;
  }

  const constructor = audioContextConstructor();

  if (!constructor) {
    return;
  }

  try {
    const context = new constructor();

    state.context = context;
    initializeAudio(state, context);
  } catch {
    void state.context?.close()
      .catch(ignoreAudioFailure);
    state.context = undefined;
    state.gain = undefined;
  }
}
