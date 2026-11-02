export type LandscapeSources = {
  element: HTMLElement;
  preview: string;
  final: string;
};

export type ProgressiveSceneState = {
  root: HTMLElement;
  scene: HTMLElement;
  request: number;
  prepared?: LandscapeSources;
  decoded: Map<string, Promise<void>>;
  observer?: MutationObserver;
  cleanup: (() => void)[];
};
