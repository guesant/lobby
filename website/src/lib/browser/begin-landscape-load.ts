import type {
  LandscapeSources,
  ProgressiveSceneState,
} from './progressive-scene.types.ts';

export function beginLandscapeLoad(
  state: ProgressiveSceneState,
  sources: LandscapeSources,
): number {
  state.prepared = sources;
  state.root.removeAttribute('data-landscape-ready');
  state.root.removeAttribute('data-landscape-preview-failed');
  sources.element.style.backgroundImage = 'none';

  state.request += 1;

  return state.request;
}
