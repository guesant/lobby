import { createLayout } from './create-layout.ts';
import { destroyLayout } from './destroy-layout.ts';

export function suspensionRails(content: HTMLElement): () => void {
  const state = createLayout(content);

  return destroyLayout.bind(null, state);
}
