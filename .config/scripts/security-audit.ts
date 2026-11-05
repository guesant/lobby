import { runSecurityOperations } from './run-security-operations.ts';
import type { SecurityOperation } from './security-operation.types.ts';

export async function security(): Promise<void> {
  const operations: SecurityOperation[] = [
    {
      kind: 'renovate',
    },
    {
      kind: 'osv',
    },
    {
      kind: 'filesystem',
    },
    {
      kind: 'sbom-generation',
    },
    {
      kind: 'semgrep',
    },
  ];

  const result = await runSecurityOperations(operations);

  if (result.failures.length > 0) {
    throw new AggregateError(result.failures, 'Security audit failed');
  }
}
