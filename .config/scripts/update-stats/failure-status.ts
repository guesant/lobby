import type {
  LinkRecord,
  StatisticsSnapshot,
} from '../../../website/src/lib/features/content/content.types.ts';

export function failureStatus(
  entry: LinkRecord,
  previous: Record<string, StatisticsSnapshot>,
  provider: string,
): 'cached' | 'unavailable' {
  if (
    previous[entry.id]?.profile_url === entry.url &&
    previous[entry.id]?.provider === provider
  ) {
    return 'cached';
  }

  return 'unavailable';
}
