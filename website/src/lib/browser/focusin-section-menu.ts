import type { SectionMenuState } from './section-menu.types.ts';

export function focusinSectionMenu(
  state: SectionMenuState,
  event: FocusEvent,
): void {
  if (
    state.menu.open &&
    event.target instanceof Node &&
    !state.menu.contains(event.target)
  ) {
    state.menu.open = false;
  }
}
