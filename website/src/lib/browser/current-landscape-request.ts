import { landscapeSources } from './landscape-sources.ts';
import type {
  LandscapeSources,
  ProgressiveSceneState,
} from './progressive-scene.types.ts';

export function currentLandscapeRequest(
  state: ProgressiveSceneState,
  sources: LandscapeSources,
  request: number,
): boolean {
  if (request !== state.request) {
    return false;
  }

  const current = landscapeSources(state);

  return (
    current?.final === sources.final && current.preview === sources.preview
  );
}
