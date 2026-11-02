import { destroyProgressiveScene } from './destroy-progressive-scene.ts';
import type { ProgressiveSceneState } from './progressive-scene.types.ts';
import { scheduleProgressiveScene } from './schedule-progressive-scene.ts';
import { on } from 'svelte/events';

export function progressiveScene(scene: HTMLElement): () => void {
  const root = document.documentElement;

  const state: ProgressiveSceneState = {
    root,
    scene,
    request: 0,
    decoded: new Map(),
    cleanup: [],
  };

  const schedule = scheduleProgressiveScene.bind(null, state);

  const colorScheme = matchMedia('(prefers-color-scheme: light)');

  state.observer = new MutationObserver(schedule);
  state.observer.observe(root, {
    attributes: true,
    attributeFilter: [
      'data-theme',
    ],
  });
  state.cleanup = [
    on(colorScheme, 'change', schedule),
    on(window, 'resize', schedule, {
      passive: true,
    }),
  ];
  schedule();

  return destroyProgressiveScene.bind(null, state);
}
