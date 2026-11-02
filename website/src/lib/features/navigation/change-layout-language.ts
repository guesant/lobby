import { selectedLanguageID } from '../../browser/navigation.ts';
import type { LayoutRuntime } from './layout-runtime.types.ts';

export function changeLayoutLanguage(
  runtime: LayoutRuntime,
  event: Event,
): void {
  const id = selectedLanguageID(event);

  if (id) {
    void runtime.navigation?.select(id);
  }
}
