import type {
  PointerFeedback,
  PointerInput,
  SoundPlayer,
  SoundTiming,
} from './audio.types.ts';

class FeedbackController {
  #enabled: boolean;

  #pressed: number | undefined;

  #released: number | undefined;

  #pressedAt = 0;

  #cancelRelease: (() => void) | undefined;

  #player: SoundPlayer;

  #clock: SoundTiming;

  constructor(player: SoundPlayer, enabled: boolean, clock: SoundTiming) {
    this.#player = player;
    this.#clock = clock;
    this.#enabled = enabled;

    if (enabled) {
      player.prepare();
    }
  }

  #valid(event: PointerInput): boolean {
    return (
      this.#enabled &&
      event.isTrusted &&
      event.pointerType === 'mouse' &&
      event.button === 0
    );
  }

  reset(): void {
    this.#pressed = undefined;
    this.#released = undefined;
    this.#cancelRelease?.();
    this.#cancelRelease = undefined;
    this.#player.stop();
  }

  press(event: PointerInput): void {
    if (!this.#valid(event)) {
      return;
    }

    this.reset();
    this.#player.resume();

    if (!this.#player.ready('press')) {
      return;
    }

    this.#pressed = event.pointerId;
    this.#pressedAt = this.#clock.now();
    this.#player.play('press');
  }

  release(event: PointerInput): void {
    if (!this.#valid(event) || this.#pressed !== event.pointerId) {
      return;
    }

    this.#pressed = undefined;

    if (!this.#player.ready('release')) {
      return;
    }

    const remaining = 80 - (this.#clock.now() - this.#pressedAt);

    if (remaining <= 0) {
      this.#player.play('release');

      return;
    }

    this.#released = event.pointerId;
    this.#cancelRelease = this.#clock.delay((): void => {
      this.#released = undefined;
      this.#cancelRelease = undefined;

      if (this.#enabled) {
        this.#player.play('release');
      }
    }, remaining);
  }

  cancel(pointerId: number): void {
    if (this.#pressed === pointerId || this.#released === pointerId) {
      this.reset();
    }
  }

  setEnabled(enabled: boolean): void {
    this.#enabled = enabled;

    if (!enabled) {
      this.reset();

      return;
    }

    this.#player.prepare();
  }

  destroy(): void {
    this.#enabled = false;
    this.reset();
    this.#player.destroy();
  }
}

export function createPointerFeedback(
  player: SoundPlayer,
  enabled: boolean,
  clock: SoundTiming,
): PointerFeedback {
  const controller = new FeedbackController(player, enabled, clock);

  return {
    press: controller.press.bind(controller),
    release: controller.release.bind(controller),
    cancel: controller.cancel.bind(controller),
    reset: controller.reset.bind(controller),
    setEnabled: controller.setEnabled.bind(controller),
    destroy: controller.destroy.bind(controller),
  };
}
