import { backgroundImageURL } from './background-image-url.ts';
import type {
  LandscapeSources,
  ProgressiveSceneState,
} from './progressive-scene.types.ts';

export function landscapeSources(
  state: ProgressiveSceneState,
): LandscapeSources | undefined {
  const element = state.scene.querySelector<HTMLElement>('.world-landscape');

  const previewElement = state.scene.querySelector('.world-landscape-preview');

  if (
    !element ||
    !previewElement ||
    !state.root.hasAttribute('data-js-enabled')
  ) {
    return undefined;
  }

  const styles = getComputedStyle(state.root);

  const previewValue = styles.getPropertyValue('--landscape-preview');

  const preview = backgroundImageURL(previewValue);

  const finalValue = styles.getPropertyValue('--landscape-image');

  const final = backgroundImageURL(finalValue);

  if (!preview || !final) {
    return undefined;
  }

  return {
    element,
    preview,
    final,
  };
}
