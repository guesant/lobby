import type { PreferenceContext } from './preference-controller.types.ts';
import { assignPreference } from './preferences.model.ts';
import type { Preferences } from './preferences.types.ts';

export function setPreference(
  context: PreferenceContext,
  key: keyof Preferences,
  value: string,
): void {
  if (!assignPreference(context.controls, key, value)) {
    return;
  }

  try {
    context.access()
      .setItem(`guesant-links-${key}`, value);
  } catch {
    return;
  }
}
