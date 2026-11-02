import type { SoundKind } from '../features/preferences/audio.types.ts';
import type { WebAudioState } from './web-audio.types.ts';

export async function loadAudio(
  state: WebAudioState,
  kind: SoundKind,
  context: AudioContext,
): Promise<void> {
  try {
    const response = await fetch(state.urls[kind], {
      priority: 'low',
      signal: state.controller.signal,
    });

    if (!response.ok) {
      return;
    }

    const audioData = await response.arrayBuffer();

    const buffer = await context.decodeAudioData(audioData);

    if (!state.controller.signal.aborted) {
      state.buffers[kind] = buffer;
    }
  } catch {
    return;
  }
}
