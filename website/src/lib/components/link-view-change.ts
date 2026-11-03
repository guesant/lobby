import type { PreferenceController } from '#lib/features/preferences/preference-controller.types.ts';

export function changeLinkView(
  preferences: PreferenceController,
  event: Event,
): void {
  if (!(event.currentTarget instanceof HTMLInputElement)) {
    return;
  }

  preferences.set('view', event.currentTarget.value);
}
