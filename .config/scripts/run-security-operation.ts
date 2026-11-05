import { runCommand } from './process.ts';
import { scanFilesystem } from './scan-filesystem.ts';
import { scanSemgrep } from './scan-semgrep.ts';
import { dependencySBOMs } from './security-inputs.ts';
import type { SecurityOperation } from './security-operation.types.ts';

export async function runSecurityOperation(
  operation: SecurityOperation,
): Promise<string[]> {
  switch (operation.kind) {
    case 'renovate': {
      await runCommand('renovate-config-validator', [
        '--strict',
        '.github/renovate.json',
      ]);
      await runCommand('node', [
        '.config/scripts/check-renovate.ts',
      ]);

      return [];
    }

    case 'osv': {
      await runCommand('node', [
        '.config/scripts/check-osv.ts',
      ]);

      return [];
    }

    case 'filesystem': {
      await scanFilesystem();

      return [];
    }

    case 'sbom-generation': {
      return dependencySBOMs();
    }

    case 'semgrep': {
      await scanSemgrep();

      return [];
    }
  }
}
