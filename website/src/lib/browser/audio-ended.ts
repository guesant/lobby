import type { WebAudioState } from './web-audio.types.ts';

export function audioEnded(
  state: WebAudioState,
  source: AudioBufferSourceNode,
): void {
  source.disconnect();

  if (state.playing === source) {
    state.playing = undefined;
  }
}
