import { formatError } from './format-error.ts';
import { scanSBOM } from './scan-sbom.ts';

export async function scanSecuritySBOMs(paths: string[]): Promise<string[]> {
  const failures: string[] = [];

  for (const path of paths) {
    try {
      await scanSBOM(path);
    } catch (error) {
      const message = formatError(error);

      const failure = `sbom-scan ${path}: ${message}`;

      failures.push(failure);
    }
  }

  return failures;
}
