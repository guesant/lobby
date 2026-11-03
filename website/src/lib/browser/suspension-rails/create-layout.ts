import type { RailLayoutState } from './rail-layout.types.ts';
import { scheduleLayout } from './schedule-layout.ts';

export function createLayout(content: HTMLElement): RailLayoutState {
  const controller = new AbortController();

  const state: RailLayoutState = {
    controller,
    content,
    frame: null,
  };

  const schedule = scheduleLayout.bind(null, state);

  const observer = new ResizeObserver(schedule);

  state.observer = observer;

  for (const element of [
    content,
    ...content.querySelectorAll<HTMLElement>('[data-rail-anchor]'),
  ]) {
    observer.observe(element);
  }

  window.addEventListener('resize', schedule, {
    signal: controller.signal,
  });
  void document.fonts.ready.then(schedule, schedule);
  scheduleLayout(state);

  return state;
}
