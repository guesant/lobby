export type RailLayoutState = {
  controller: AbortController;
  content: HTMLElement;
  observer?: ResizeObserver;
  frame: number | null;
};
