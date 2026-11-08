export function validFederationLanguage(language: string): boolean {
  const [
    primary,
    ...subtags
  ] = language.split('-');

  if (!primary || !/^[a-z]{2,3}$/.test(primary)) {
    return false;
  }

  for (const subtag of subtags) {
    if (!/^[a-z0-9]{2,8}$/.test(subtag)) {
      return false;
    }
  }

  return true;
}
