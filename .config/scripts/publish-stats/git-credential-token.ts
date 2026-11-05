export function gitCredentialToken(credential: string): string {
  const decoded = Buffer.from(credential, 'base64');

  const authentication = decoded.toString('utf8');

  const separator = authentication.indexOf(':');

  if (separator < 0) {
    return '';
  }

  return authentication.slice(separator + 1);
}
