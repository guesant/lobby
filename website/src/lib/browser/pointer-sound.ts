import { createPointerFeedback } from '../features/preferences/audio.controller.ts';
import type { PointerSound } from '../features/preferences/audio.types.ts';
import { destroyPointerSound } from './destroy-pointer-sound.ts';
import { installPointerListeners } from './install-pointer-listeners.ts';
import type {
  PointerSoundState,
  PointerSoundURLs,
} from './pointer-sound.types.ts';
import { setPointerSoundEnabled } from './set-pointer-sound-enabled.ts';
import { soundTiming } from './sound-timing.ts';
import { createWebAudioPlayer } from './web-audio.ts';

export function createPointerSound(
  urls: PointerSoundURLs,
  enabled: boolean,
): PointerSound {
  const player = createWebAudioPlayer({
    press: urls.pointerPress,
    release: urls.pointerRelease,
  });

  const state: PointerSoundState = {
    feedback: createPointerFeedback(player, enabled, soundTiming),
    controller: new AbortController(),
  };

  installPointerListeners(state);

  return {
    setEnabled: setPointerSoundEnabled.bind(null, state),
    destroy: destroyPointerSound.bind(null, state),
  };
}
