import type { StatisticsFetcher } from './statistics.types.ts';

export async function request(
  url: string,
  options: RequestInit,
  fetcher: StatisticsFetcher,
): Promise<unknown> {
  const timeoutSignal = AbortSignal.timeout(20000);

  const response = await fetcher(url, {
    ...options,
    redirect: 'error',
    signal: timeoutSignal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)}`);
  }

  return response.json() as Promise<unknown>;
}
