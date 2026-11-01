export type SoundKind = 'press' | 'release';

export type PointerInput = Pick<
  PointerEvent,
  'isTrusted' | 'pointerType' | 'button' | 'pointerId'
>;

export type SoundPlayer = {
  prepare(): void;
  resume(): void;
  ready(kind: SoundKind): boolean;
  play(kind: SoundKind): void;
  stop(): void;
  destroy(): void;
};

export type SoundTiming = {
  now(): number;
  delay(callback: () => void, duration: number): () => void;
};

export type PointerFeedback = {
  press(event: PointerInput): void;
  release(event: PointerInput): void;
  cancel(pointerId: number): void;
  reset(): void;
  setEnabled(enabled: boolean): void;
  destroy(): void;
};

export type PointerSound = Pick<PointerFeedback, 'setEnabled' | 'destroy'>;

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

export function createPointerFeedback(
  player: SoundPlayer,
  initialEnabled: boolean,
  clock: SoundTiming = timing,
): PointerFeedback {
  let enabled = initialEnabled;

  let pressed: number | undefined;

  let released: number | undefined;

  let pressedAt = 0;

  let cancelRelease: (() => void) | undefined;

  function valid(event: PointerInput): boolean {
    return (
      enabled &&
      event.isTrusted &&
      event.pointerType === 'mouse' &&
      event.button === 0
    );
  }

  function reset(): void {
    pressed = undefined;
    released = undefined;
    cancelRelease?.();
    cancelRelease = undefined;
    player.stop();
  }

  if (enabled) {
    player.prepare();
  }

  return {
    press(event): void {
      if (!valid(event)) {
        return;
      }

      reset();
      player.resume();

      if (!player.ready('press')) {
        return;
      }

      pressed = event.pointerId;
      pressedAt = clock.now();
      player.play('press');
    },
    release(event): void {
      if (!valid(event) || pressed !== event.pointerId) {
        return;
      }

      pressed = undefined;

      if (!player.ready('release')) {
        return;
      }

      const remaining = 80 - (clock.now() - pressedAt);

      if (remaining <= 0) {
        player.play('release');

        return;
      }

      released = event.pointerId;
      cancelRelease = clock.delay((): void => {
        released = undefined;
        cancelRelease = undefined;

        if (enabled) {
          player.play('release');
        }
      }, remaining);
    },
    cancel(pointerId): void {
      if (pressed === pointerId || released === pointerId) {
        reset();
      }
    },
    reset,
    setEnabled(value): void {
      enabled = value;

      if (!enabled) {
        reset();

        return;
      }

      player.prepare();
    },
    destroy(): void {
      enabled = false;
      reset();
      player.destroy();
    },
  };
}

function createWebAudioPlayer(urls: Record<SoundKind, string>): SoundPlayer {
  const controller = new AbortController();

  let context: AudioContext | undefined;

  let gain: GainNode | undefined;

  let playing: AudioBufferSourceNode | undefined;

  const buffers: Partial<Record<SoundKind, AudioBuffer>> = {};

  function stop(): void {
    if (!playing) {
      return;
    }

    try {
      playing.stop();
    } catch {}

    playing.disconnect();
    playing = undefined;
  }

  function prepare(): void {
    if (context || controller.signal.aborted) {
      return;
    }

    const constructor =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!constructor) {
      return;
    }

    try {
      context = new constructor();
      gain = context.createGain();
      gain.gain.value = 0.04;
      gain.connect(context.destination);
    } catch {
      context = undefined;
      gain = undefined;

      return;
    }

    for (const kind of [
      'press',
      'release',
    ] as const) {
      void fetch(urls[kind], {
        priority: 'low',
        signal: controller.signal,
      })
        .then(async (response): Promise<void> => {
          if (!response.ok || !context) {
            return;
          }

          const buffer = await context.decodeAudioData(
            await response.arrayBuffer(),
          );

          if (!controller.signal.aborted) {
            buffers[kind] = buffer;
          }
        })
        .catch((): void => {});
    }
  }

  return {
    prepare,
    resume(): void {
      if (context?.state !== 'suspended') {
        return;
      }

      try {
        void context.resume()
          .catch((): void => {});
      } catch {}
    },
    ready(kind): boolean {
      return Boolean(gain && buffers[kind] && context?.state === 'running');
    },
    play(kind): void {
      stop();

      const buffer = buffers[kind];

      if (!gain || !buffer || context?.state !== 'running') {
        return;
      }

      try {
        const source = context.createBufferSource();

        source.buffer = buffer;
        source.connect(gain);
        source.addEventListener(
          'ended',
          (): void => {
            source.disconnect();

            if (playing === source) {
              playing = undefined;
            }
          },
          {
            once: true,
            signal: controller.signal,
          },
        );
        source.start();
        playing = source;
      } catch {}
    },
    stop,
    destroy(): void {
      controller.abort();
      stop();
      void context?.close()
        .catch((): void => {});
    },
  };
}

export function createPointerSound(
  urls: {
    pointerPress: string;
    pointerRelease: string;
  },
  enabled: boolean,
): PointerSound {
  const player = createWebAudioPlayer({
    press: urls.pointerPress,
    release: urls.pointerRelease,
  });

  const feedback = createPointerFeedback(player, enabled);

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
