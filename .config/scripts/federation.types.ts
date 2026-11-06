import type { FederationItem } from '../../website/src/lib/features/content/content.types.ts';
import type { TechnologyGroup } from '../../website/src/lib/features/profile/profile.types.ts';

export type Source = {
  id: string;
  origin: string;
  url?: string;
};

export type Feed = {
  version: 1;
  source: 'blog' | 'resume';
  items: FederationItem[];
  technologies?: TechnologyGroup[];
};

export type LoadOptions = {
  cacheDirectory: string;
  localFile?: string | undefined;
  fetcher?: (
    url: string,
    options?: RequestInit,
  ) => Promise<{
    ok: boolean;
    status?: number;
    text(): Promise<string>;
  }>;
  warn?: (message: string) => void;
  now?: () => Date;
};
