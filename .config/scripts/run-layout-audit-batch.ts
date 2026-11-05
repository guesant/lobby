import { throwOnRejected } from './throw-on-rejected.ts';

export async function runLayoutAuditBatch(
  audits: Promise<void>[],
): Promise<void> {
  const results = await Promise.allSettled(audits);

  throwOnRejected(results, 'Browser audit batch failed');
}
