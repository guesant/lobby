import type { WebAudioState } from './web-audio.types.ts';

export function stopAudio(state: WebAudioState): void {
  const playing = state.playing;

  if (!playing) {
    return;
  }

  state.playing = undefined;

  try {
    playing.stop();
  } catch {
    return;
  } finally {
    playing.disconnect();
  }
}
