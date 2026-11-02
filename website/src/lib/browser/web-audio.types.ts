import type { SoundKind } from '../features/preferences/audio.types.ts';

export type WebAudioState = {
  controller: AbortController;
  context: AudioContext | undefined;
  gain: GainNode | undefined;
  playing: AudioBufferSourceNode | undefined;
  buffers: Partial<Record<SoundKind, AudioBuffer>>;
  urls: Record<SoundKind, string>;
};
