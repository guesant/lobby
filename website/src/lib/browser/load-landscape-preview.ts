import { decodeSceneImage } from './decode-scene-image.ts';
import type {
  LandscapeSources,
  ProgressiveSceneState,
} from './progressive-scene.types.ts';

export async function loadLandscapePreview(
  state: ProgressiveSceneState,
  sources: LandscapeSources,
  request: number,
): Promise<boolean> {
  try {
    await decodeSceneImage(state, sources.preview);

    return request === state.request;
  } catch {
    if (request === state.request) {
      sources.element.style.backgroundImage = `url("${sources.final}")`;
      state.root.dataset['landscapePreviewFailed'] = 'true';
    }

    return false;
  }
}
