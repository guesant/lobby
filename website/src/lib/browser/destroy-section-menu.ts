import type { SectionMenuState } from './section-menu.types.ts';

export function destroySectionMenu(state: SectionMenuState): void {
  state.controller.abort();
}
