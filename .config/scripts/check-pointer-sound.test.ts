import { createPointerFeedback } from '../../website/src/lib/features/preferences/audio.controller.ts';
import {
  type PointerInput,
  type SoundKind,
  type SoundPlayer,
  type SoundTiming,
} from '../../website/src/lib/features/preferences/audio.types.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

function idle(): void {
  return;
}

function harness(): {
  feedback: ReturnType<typeof createPointerFeedback>;
  sounds: SoundKind[];
  timers: Set<() => void>;
  elapsed(value: number): void;
  flush(): void;
} {
  let now = 0;

  const sounds: SoundKind[] = [];

  const timers = new Set<() => void>();

  const player: SoundPlayer = {
    prepare: idle,
    resume: idle,
    ready(): boolean {
      return true;
    },
    play(kind): void {
      sounds.push(kind);
    },
    stop: idle,
    destroy: idle,
  };

  const timing: SoundTiming = {
    now(): number {
      return now;
    },
    delay(callback): () => void {
      timers.add(callback);

      return (): void => {
        timers.delete(callback);
      };
    },
  };

  const feedback = createPointerFeedback(player, true, timing);

  return {
    feedback,
    sounds,
    timers,
    elapsed(value: number): void {
      now = value;
    },
    flush(): void {
      for (const callback of [
        ...timers,
      ]) {
        timers.delete(callback);
        callback();
      }
    },
  };
}

const mouse: PointerInput = {
  isTrusted: true,
  pointerType: 'mouse',
  pointerId: 7,
  button: 0,
};

test('press plays immediately and a quick release waits without delaying press', (): void => {
  const h = harness();

  h.feedback.press(mouse);
  assert.deepEqual(h.sounds, [
    'press',
  ]);
  h.elapsed(10);
  h.feedback.release(mouse);
  assert.deepEqual(h.sounds, [
    'press',
  ]);
  assert.equal(h.timers.size, 1);
  h.flush();
  assert.deepEqual(h.sounds, [
    'press',
    'release',
  ]);
});

test('rapid clicks cancel an older pending release', (): void => {
  const h = harness();

  h.feedback.press(mouse);
  h.feedback.release(mouse);
  h.feedback.press(mouse);
  h.flush();
  assert.deepEqual(h.sounds, [
    'press',
    'press',
  ]);
});

test('touch, pen, secondary buttons and synthetic events are silent', (): void => {
  const h = harness();

  for (const invalid of [
    {
      ...mouse,
      pointerType: 'touch',
    },
    {
      ...mouse,
      pointerType: 'pen',
    },
    {
      ...mouse,
      button: 1,
    },
    {
      ...mouse,
      button: 2,
    },
    {
      ...mouse,
      isTrusted: false,
    },
  ]) {
    h.feedback.press(invalid);
    h.feedback.release(invalid);
  }

  assert.deepEqual(h.sounds, []);
});

test('cancellation, focus loss and visibility reset discard a pending release', (): void => {
  for (const cancel of [
    'pointer',
    'reset',
  ]) {
    const h = harness();

    h.feedback.press(mouse);
    h.feedback.release(mouse);

    if (cancel === 'pointer') {
      h.feedback.cancel(mouse.pointerId);
    } else {
      h.feedback.reset();
    }

    h.flush();
    assert.deepEqual(h.sounds, [
      'press',
    ]);
  }
});
