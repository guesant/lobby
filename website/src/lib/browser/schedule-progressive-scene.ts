import { prepareProgressiveScene } from './prepare-progressive-scene.ts';
import type { ProgressiveSceneState } from './progressive-scene.types.ts';

export function scheduleProgressiveScene(state: ProgressiveSceneState): void {
  void prepareProgressiveScene(state);
}
