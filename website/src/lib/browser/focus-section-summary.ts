import type { SectionMenuState } from './section-menu.types.ts';

export function focusSectionSummary(state: SectionMenuState): void {
  state.menu.querySelector('summary')
    ?.focus({
      preventScroll: true,
    });
}
