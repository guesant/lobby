import { createPreferenceController } from '../../website/src/lib/features/preferences/preferences.controller.ts';
import { defaultPreferences } from '../../website/src/lib/features/preferences/preferences.model.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('view and sound preferences persist independently and survive route changes', (): void => {
  const entries = new Map<string, string>();

  const storage = {
    getItem(key: string): string | null {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      entries.set(key, value);
    },
  };

  const ui = defaultPreferences();

  const preferences = createPreferenceController(ui, (): typeof storage => {
    return storage;
  });

  preferences.set('view', 'detailed');
  preferences.set('sound', 'off');

  const next = defaultPreferences();

  createPreferenceController(next, (): typeof storage => {
    return storage;
  })
    .restore();
  assert.equal(next.view, 'detailed');
  assert.equal(next.sound, 'off');
  assert.equal(next.theme, 'system');
});

test('storage failures do not prevent an explicit choice', (): void => {
  const ui = defaultPreferences();

  function blocked(): never {
    throw new Error('blocked');
  }

  const preferences = createPreferenceController(ui, blocked);

  preferences.restore();
  preferences.set('view', 'detailed');
  assert.equal(ui.view, 'detailed');
  preferences.set('view', 'unknown');
  assert.equal(ui.view, 'detailed');
});
