import type { SoundKind } from '../features/preferences/audio.types.ts';
import { audioEnded } from './audio-ended.ts';
import { stopAudio } from './stop-audio.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function playAudio(state: WebAudioState, kind: SoundKind): void {
  stopAudio(state);

  const buffer = state.buffers[kind];

  const gain = state.gain;

  const context = state.context;

  if (!gain || !buffer || context?.state !== 'running') {
    return;
  }

  const source = context.createBufferSource();

  const handleEnded = audioEnded.bind(null, state, source);

  source.buffer = buffer;
  source.connect(gain);
  source.addEventListener('ended', handleEnded, {
    once: true,
    signal: state.controller.signal,
  });

  try {
    source.start();
    state.playing = source;
  } catch {
    source.disconnect();
  }
}
