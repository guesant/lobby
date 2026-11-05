import { formatError } from './format-error.ts';
import { runSecurityOperation } from './run-security-operation.ts';
import { scanSecuritySBOMs } from './scan-security-sboms.ts';
import type {
  SecurityAuditResult,
  SecurityOperation,
} from './security-operation.types.ts';

export async function runSecurityOperations(
  operations: SecurityOperation[],
): Promise<SecurityAuditResult> {
  const failures: string[] = [];

  for (const operation of operations) {
    try {
      const paths = await runSecurityOperation(operation);

      if (operation.kind === 'sbom-generation') {
        const scanFailures = await scanSecuritySBOMs(paths);

        failures.push(...scanFailures);
      }
    } catch (error) {
      const message = formatError(error);

      const failure = `${operation.kind}: ${message}`;

      failures.push(failure);
    }
  }

  return {
    failures,
  };
}
