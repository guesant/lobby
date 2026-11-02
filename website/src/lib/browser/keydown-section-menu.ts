import { focusSectionSummary } from './focus-section-summary.ts';
import type { SectionMenuState } from './section-menu.types.ts';

export function keydownSectionMenu(
  state: SectionMenuState,
  event: KeyboardEvent,
): void {
  if (event.key !== 'Escape' || !state.menu.open) {
    return;
  }

  event.preventDefault();
  state.menu.open = false;
  focusSectionSummary(state);
}
