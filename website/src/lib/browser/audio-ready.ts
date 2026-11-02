import type { SoundKind } from '../features/preferences/audio.types.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function audioReady(state: WebAudioState, kind: SoundKind): boolean {
  return Boolean(
    state.gain && state.buffers[kind] && state.context?.state === 'running',
  );
}
