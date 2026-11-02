import type { ProgressiveSceneState } from './progressive-scene.types.ts';

export function destroyProgressiveScene(state: ProgressiveSceneState): void {
  state.request += 1;
  state.observer?.disconnect();

  for (const dispose of state.cleanup) {
    dispose();
  }
}
