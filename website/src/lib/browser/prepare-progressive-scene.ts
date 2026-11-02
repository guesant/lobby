import { beginLandscapeLoad } from './begin-landscape-load.ts';
import { currentLandscapeRequest } from './current-landscape-request.ts';
import { decodeSceneImage } from './decode-scene-image.ts';
import { landscapeSources } from './landscape-sources.ts';
import { landscapeSourcesChanged } from './landscape-sources-changed.ts';
import { loadLandscapePreview } from './load-landscape-preview.ts';
import type { ProgressiveSceneState } from './progressive-scene.types.ts';

export async function prepareProgressiveScene(
  state: ProgressiveSceneState,
): Promise<void> {
  const sources = landscapeSources(state);

  if (!sources || !landscapeSourcesChanged(state, sources)) {
    return;
  }

  const request = beginLandscapeLoad(state, sources);

  if (!(await loadLandscapePreview(state, sources, request))) {
    return;
  }

  try {
    await decodeSceneImage(state, sources.final, 'low');
  } catch {
    if (request === state.request) {
      delete state.prepared;
    }

    return;
  }

  if (currentLandscapeRequest(state, sources, request)) {
    sources.element.style.backgroundImage = `url("${sources.final}")`;
    state.root.dataset['landscapeReady'] = 'true';
  }
}
