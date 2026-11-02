import type { PreferenceContext } from './preference-controller.types.ts';
import { assignPreference, preferenceKeys } from './preferences.model.ts';

export function restorePreferences(context: PreferenceContext): void {
  for (const key of preferenceKeys) {
    try {
      const saved = context.access()
        .getItem(`guesant-links-${key}`);

      if (saved !== null) {
        assignPreference(context.controls, key, saved);
      }
    } catch {
      continue;
    }
  }
}
