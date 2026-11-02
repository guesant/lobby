import type { StatisticsFetcher } from './statistics.types.ts';

export function integer(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('Invalid public statistic');
  }

  return value;
}

export async function request(
  url: string,
  options: RequestInit,
  fetcher: StatisticsFetcher,
): Promise<unknown> {
  const response = await fetcher(url, {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)}`);
  }

  return response.json() as Promise<unknown>;
}
