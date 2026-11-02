export type StatisticsFetcher = (
  url: string,
  options?: RequestInit,
) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

export type CollectedStats = {
  username: string;
  metrics: Record<string, number>;
  available?: Record<string, number>;
};

export type CollectionResult = {
  id: string;
  status: 'updated' | 'cached' | 'unavailable';
  reason?: string;
};
