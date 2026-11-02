import type { MenuGeometry } from './section-menu.types.ts';

export function menuGeometry(
  trigger: HTMLElement,
  navigation: Element,
  panel: HTMLElement,
): MenuGeometry {
  const rect = navigation.getBoundingClientRect();

  const panelStyles = getComputedStyle(panel);

  const gapValue = panelStyles.marginBlockStart;

  const gap = parseFloat(gapValue);

  const below = window.innerHeight - rect.bottom - gap * 2;

  const above = rect.top - gap * 2;

  const triggerStyles = getComputedStyle(trigger);

  const minimumHeight = parseFloat(triggerStyles.minHeight);

  const minimum = minimumHeight * 3;

  if (below < Math.min(minimum, above)) {
    return {
      placement: 'above',
      available: above,
    };
  }

  return {
    placement: 'below',
    available: below,
  };
}
