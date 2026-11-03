export function privacyPageURL(
  locale: string,
  interfaceName: 'minecraft' | 'terminal',
): string {
  let prefix = `/${locale}/`;

  if (interfaceName === 'terminal') {
    prefix += 'terminal/';
  }

  return `${prefix}privacy/`;
}
