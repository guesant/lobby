import type { GitDiagnosticResult } from './git-diagnostic.types.ts';
import { gitOperation } from './git-operation.ts';
import { redactGitDiagnostic } from './redact-git-diagnostic.ts';

export function statisticsGitError(
  args: string[],
  result: GitDiagnosticResult,
): Error {
  const operation = gitOperation(args);

  const status = result.signal ?? String(result.status ?? 'unavailable');

  let diagnostic = result.stderr;

  if (!diagnostic) {
    diagnostic = result.error?.message ?? 'No diagnostic available';
  }

  const detail = diagnostic.trim();

  const message = `Statistics git ${operation} failed (${status}): ${detail}`;

  const redacted = redactGitDiagnostic(message, args);

  return new Error(redacted);
}
