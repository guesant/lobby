import { loadAudio } from './load-audio.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function initializeAudio(
  state: WebAudioState,
  context: AudioContext,
): void {
  const gain = context.createGain();

  gain.gain.value = 0.04;
  gain.connect(context.destination);
  state.gain = gain;
  void loadAudio(state, 'press', context);
  void loadAudio(state, 'release', context);
}
