import type { PageLoadData } from '../content/content.types.ts';

export type InterfaceDependencies = {
  page: () => PageLoadData;
  currentURL: () => URL;
  closeDialog: () => void;
  navigate: (url: URL) => Promise<void>;
};

export type InterfaceController = {
  select: (selected: string) => Promise<void>;
};
