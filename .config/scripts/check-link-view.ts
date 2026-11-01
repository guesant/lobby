import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assignPreference,
  restorePreferences,
  setPreference,
  type InterfaceState,
} from '../../website/src/lib/preferences.svelte.ts';

function state(): InterfaceState {
  return {
    theme: 'system',
    view: 'compact',
    motion: 'on',
    sound: 'on',
    dialog: 'none',
    reducedMotion: false,
  };
}

void test('preferences retain safe defaults and reject unknown persisted values', (): void => {
  const ui = state();

  assert.equal(assignPreference(ui, 'view', 'unknown'), false);
  assert.equal(ui.view, 'compact');
  assert.equal(assignPreference(ui, 'sound', 'unknown'), false);
  assert.equal(ui.sound, 'on');
  assert.equal(assignPreference(ui, 'theme', 'light'), true);
  assert.equal(ui.theme, 'light');
});

void test('view and sound preferences persist independently and survive route changes', (): void => {
  const entries = new Map<string, string>();

  const storage = {
    getItem(key: string): string | null {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      entries.set(key, value);
    },
  };

  const ui = state();

  setPreference(ui, 'view', 'detailed', (): typeof storage => {
    return storage;
  });
  setPreference(ui, 'sound', 'off', (): typeof storage => {
    return storage;
  });

  const next = state();

  restorePreferences(next, (): typeof storage => {
    return storage;
  });
  assert.equal(next.view, 'detailed');
  assert.equal(next.sound, 'off');
  assert.equal(next.theme, 'system');
});

void test('storage failures do not prevent an explicit choice', (): void => {
  const ui = state();

  const blocked = (): never => {
    throw new Error('blocked');
  };

  restorePreferences(ui, blocked);
  setPreference(ui, 'view', 'detailed', blocked);
  assert.equal(ui.view, 'detailed');
  setPreference(ui, 'view', 'unknown', blocked);
  assert.equal(ui.view, 'detailed');
});
