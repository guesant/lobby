import { positionSectionMenu } from './position-section-menu.ts';
import type { SectionMenuState } from './section-menu.types.ts';

export function toggleSectionMenu(state: SectionMenuState, event: Event): void {
  if (
    event.target instanceof Element &&
    event.target.matches('[data-section-switcher]')
  ) {
    positionSectionMenu(state);
  }
}
