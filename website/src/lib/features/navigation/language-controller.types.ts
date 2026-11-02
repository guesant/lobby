import type { PreferenceStorage } from '../preferences/preferences.model.ts';
import type { LanguagePage } from './language.types.ts';

export type LanguageDependencies = {
  page: () => LanguagePage | null;
  storage: () => Pick<PreferenceStorage, 'getItem' | 'setItem'>;
  languages: () => readonly string[];
  navigate: (url: URL) => Promise<void>;
  replaceURL: (url: URL) => Promise<void>;
  fallback: (url: URL) => void;
};

export type LanguageNavigationState = {
  dependencies: LanguageDependencies;
  generation: number;
  pending: boolean;
  destroyed: boolean;
  fellBack: boolean;
  destination: string | null;
};

export type LanguageNavigation = {
  normalize: () => Promise<void>;
  select: (id: string) => Promise<void>;
  beforeNavigate: (url: URL | null) => void;
  destroy: () => void;
};
