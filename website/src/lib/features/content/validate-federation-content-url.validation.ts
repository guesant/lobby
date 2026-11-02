import type { FederationContentIdentity } from './federation-validation.types.ts';

export function validateFederationContentURL(
  value: string,
  label: string,
  identity: FederationContentIdentity,
): string {
  const url = new URL(value);

  const allowedHosts = new Set([
    'github.com',
    'gitlab.com',
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
  ]);

  if (
    identity.source !== 'resume' ||
    identity.type !== 'project' ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !allowedHosts.has(url.hostname)
  ) {
    throw new Error(`Invalid ${label}.metadata.content_url`);
  }

  return url.href;
}
