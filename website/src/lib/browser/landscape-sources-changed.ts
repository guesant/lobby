import type {
  LandscapeSources,
  ProgressiveSceneState,
} from './progressive-scene.types.ts';

export function landscapeSourcesChanged(
  state: ProgressiveSceneState,
  sources: LandscapeSources,
): boolean {
  const prepared = state.prepared;

  if (!prepared) {
    return true;
  }

  return (
    prepared.element !== sources.element ||
    prepared.preview !== sources.preview ||
    prepared.final !== sources.final
  );
}
