import { destroySectionMenu } from './destroy-section-menu.ts';
import { installSectionMenu } from './install-section-menu.ts';
import type { SectionMenuState } from './section-menu.types.ts';

export function sectionMenu(menu: HTMLDetailsElement): () => void {
  const state: SectionMenuState = {
    menu,
    controller: new AbortController(),
  };

  installSectionMenu(state);

  return destroySectionMenu.bind(null, state);
}
