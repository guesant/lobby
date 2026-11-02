import { menuGeometry } from './menu-geometry.ts';
import type { SectionMenuState } from './section-menu.types.ts';

export function positionSectionMenu(state: SectionMenuState): void {
  if (!state.menu.open) {
    return;
  }

  const trigger = state.menu.querySelector<HTMLElement>('summary');

  const panel = state.menu.querySelector<HTMLElement>('.section-menu');

  const navigation = state.menu.closest('.page-navigation');

  if (!trigger || !panel || !navigation) {
    return;
  }

  const geometry = menuGeometry(trigger, navigation, panel);

  const nonnegativeHeight = Math.max(0, geometry.available);

  const availableHeight = `${String(nonnegativeHeight)}px`;

  state.menu.dataset['placement'] = geometry.placement;
  state.menu.style.setProperty(
    '--navigation-available-height',
    availableHeight,
  );
}
