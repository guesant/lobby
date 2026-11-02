import { focusSectionSummary } from './focus-section-summary.ts';
import type { SectionMenuState } from './section-menu.types.ts';

export function pointerdownSectionMenu(
  state: SectionMenuState,
  event: PointerEvent,
): void {
  if (
    !state.menu.open ||
    !(event.target instanceof Node) ||
    state.menu.contains(event.target)
  ) {
    return;
  }

  const restoreFocus = state.menu.contains(document.activeElement);

  state.menu.open = false;

  if (restoreFocus) {
    focusSectionSummary(state);
  }
}
