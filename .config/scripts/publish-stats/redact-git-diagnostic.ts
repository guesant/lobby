import { gitDiagnosticSecrets } from './git-diagnostic-secrets.ts';

export function redactGitDiagnostic(message: string, args: string[]): string {
  const secrets = gitDiagnosticSecrets(args);

  let redacted = message;

  for (const secret of secrets) {
    redacted = redacted.replaceAll(secret, '[REDACTED]');
  }

  return redacted;
}
