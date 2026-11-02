export type SectionMenuState = {
  menu: HTMLDetailsElement;
  controller: AbortController;
};

export type MenuGeometry = {
  placement: 'above' | 'below';
  available: number;
};
