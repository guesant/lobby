import { gitCredentialToken } from './git-credential-token.ts';

export function gitDiagnosticSecrets(args: string[]): string[] {
  const secrets = new Set<string>();

  const workflowToken = process.env['GITHUB_STATS_PUBLISH_TOKEN'];

  if (workflowToken) {
    secrets.add(workflowToken);
  }

  for (const argument of args) {
    const match = /extraheader=authorization:\s*basic\s+(\S+)/i.exec(argument);

    const credential = match?.[1];

    if (!credential) {
      continue;
    }

    secrets.add(credential);

    const token = gitCredentialToken(credential);

    if (token) {
      secrets.add(token);
    }
  }

  return [
    ...secrets,
  ];
}
