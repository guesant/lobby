import type { FederationItem } from '../../website/src/lib/features/content/content.types.ts';

export type Source = {
  id: string;
  origin: string;
  url?: string;
};

export type Feed = {
  version: 1;
  source: 'blog' | 'resume';
  items: FederationItem[];
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
