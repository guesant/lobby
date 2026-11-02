import type {
  SoundKind,
  SoundPlayer,
} from '../features/preferences/audio.types.ts';
import { audioReady } from './audio-ready.ts';
import { destroyAudio } from './destroy-audio.ts';
import { playAudio } from './play-audio.ts';
import { prepareAudio } from './prepare-audio.ts';
import { resumeAudio } from './resume-audio.ts';
import { stopAudio } from './stop-audio.ts';
import type { WebAudioState } from './web-audio.types.ts';

export function createWebAudioPlayer(
  urls: Record<SoundKind, string>,
): SoundPlayer {
  const state: WebAudioState = {
    controller: new AbortController(),
    context: undefined,
    gain: undefined,
    playing: undefined,
    buffers: {},
    urls,
  };

  return {
    prepare: prepareAudio.bind(null, state),
    resume: resumeAudio.bind(null, state),
    ready: audioReady.bind(null, state),
    play: playAudio.bind(null, state),
    stop: stopAudio.bind(null, state),
    destroy: destroyAudio.bind(null, state),
  };
}
