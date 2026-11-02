import { focusinSectionMenu } from './focusin-section-menu.ts';
import { keydownSectionMenu } from './keydown-section-menu.ts';
import { pointerdownSectionMenu } from './pointerdown-section-menu.ts';
import { positionSectionMenu } from './position-section-menu.ts';
import type { SectionMenuState } from './section-menu.types.ts';
import { toggleSectionMenu } from './toggle-section-menu.ts';

export function installSectionMenu(state: SectionMenuState): void {
  const signal = state.controller.signal;

  const onToggle = toggleSectionMenu.bind(null, state);

  const onKeydown = keydownSectionMenu.bind(null, state);

  const onPointerdown = pointerdownSectionMenu.bind(null, state);

  const onFocusin = focusinSectionMenu.bind(null, state);

  const onPosition = positionSectionMenu.bind(null, state);

  document.addEventListener('toggle', onToggle, {
    capture: true,
    signal,
  });
  document.addEventListener('keydown', onKeydown, {
    signal,
  });
  document.addEventListener('pointerdown', onPointerdown, {
    signal,
  });
  document.addEventListener('focusin', onFocusin, {
    signal,
  });
  window.addEventListener('resize', onPosition, {
    signal,
  });
  document.addEventListener('scroll', onPosition, {
    passive: true,
    capture: true,
    signal,
  });
}
