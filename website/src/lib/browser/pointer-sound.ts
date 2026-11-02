import { createPointerFeedback } from '../features/preferences/audio.controller.ts';
import type {
  PointerSound,
  SoundTiming,
} from '../features/preferences/audio.types.ts';
import { WebAudioPlayer } from './web-audio.ts';

const timing: SoundTiming = {
  now(): number {
    return performance.now();
  },
  delay(callback, duration): () => void {
    const timer = setTimeout(callback, duration);

    return (): void => {
      clearTimeout(timer);
    };
  },
};

export function createPointerSound(
  urls: {
    pointerPress: string;
    pointerRelease: string;
  },
  enabled: boolean,
): PointerSound {
  const player = new WebAudioPlayer({
    press: urls.pointerPress,
    release: urls.pointerRelease,
  });

  const feedback = createPointerFeedback(player, enabled, timing);

  const controller = new AbortController();

  const options = {
    capture: true,
    passive: true,
    signal: controller.signal,
  };

  document.addEventListener('pointerdown', feedback.press, options);
  document.addEventListener('pointerup', feedback.release, options);
  document.addEventListener(
    'pointercancel',
    (event): void => {
      feedback.cancel(event.pointerId);
    },
    options,
  );
  window.addEventListener('blur', feedback.reset, {
    signal: controller.signal,
  });
  document.addEventListener(
    'visibilitychange',
    (): void => {
      if (document.hidden) {
        feedback.reset();
      }
    },
    {
      signal: controller.signal,
    },
  );

  return {
    setEnabled: feedback.setEnabled,
    destroy(): void {
      controller.abort();
      feedback.destroy();
    },
  };
}
