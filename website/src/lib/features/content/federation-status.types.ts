export type FederationStatus = {
  id: 'blog' | 'resume';
  mode: 'remote' | 'local' | 'cache';
  lastSuccessfulFetchAt: string | null;
};
